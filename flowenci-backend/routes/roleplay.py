"""
Roleplay router — WebSocket-based AI interview sessions.
"""
import json
import logging
import uuid
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException
from supabase import Client

from database import get_db
from schemas.roleplay import (
    StartSessionRequest, StartSessionResponse,
    WSIncomingMessage, WSOutgoingMessage,
    SessionFeedbackResponse, SessionListItem,
)
from services.interviewer.session_manager import create_session, get_session, end_session
from services.interviewer.gpt_interviewer import get_interviewer_response
from services.interviewer.tts_service import text_to_speech_base64
from services.interviewer.session_evaluator import evaluate_and_save_session
from utils.jwt import get_current_user

router = APIRouter(prefix="/roleplay", tags=["AI Interviewer"])
logger = logging.getLogger(__name__)

VALID_COMPANIES = {"amazon", "google", "startup", "infosys", "generic"}
VALID_INTERVIEW_TYPES = {"behavioral", "technical", "mixed"}


@router.post("/start", response_model=StartSessionResponse)
async def start_session(
    payload: StartSessionRequest,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    company_key = payload.company_key.lower()
    if company_key not in VALID_COMPANIES:
        raise HTTPException(400, f"Invalid company_key. Choose from: {VALID_COMPANIES}")
    if payload.interview_type not in VALID_INTERVIEW_TYPES:
        raise HTTPException(400, f"Invalid interview_type. Choose from: {VALID_INTERVIEW_TYPES}")
    if not 3 <= payload.max_turns <= 15:
        raise HTTPException(400, "max_turns must be between 3 and 15")

    db_session_dict = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "company": payload.company_key,
        "interview_type": payload.interview_type,
        "status": "active",
        "conversation_history": [],
        "total_turns": 0,
        "started_at": datetime.now(timezone.utc).isoformat()
    }
    res_s = db.table("interview_sessions").insert(db_session_dict).execute()
    db_session = res_s.data[0]

    active = create_session(
        user_id=str(current_user["id"]),
        company_key=company_key,
        interview_type=payload.interview_type,
        role=payload.role,
        experience_level=current_user.get("experience_level", "student"),
        max_turns=payload.max_turns,
    )
    active.db_session_id = str(db_session["id"])

    return StartSessionResponse(
        session_id=active.session_id,
        db_session_id=str(db_session["id"]),
        message="Session started. Connect to the WebSocket to begin your interview.",
    )


@router.websocket("/session/{session_id}")
async def interview_websocket(
    websocket: WebSocket,
    session_id: str,
    db: Client = Depends(get_db),
):
    await websocket.accept()
    active = get_session(session_id)

    if not active:
        await websocket.send_json({
            "type": "error",
            "content": "Session not found or expired.",
        })
        await websocket.close(code=4004)
        return

    try:
        opening_text = await get_interviewer_response(
            conversation_history=active.conversation_history,
            company_key=active.company_key,
            interview_type=active.interview_type,
            role=active.role,
            experience_level=active.experience_level,
            current_turn=active.current_turn,
            max_turns=active.max_turns,
        )
        active.add_assistant_message(opening_text)
        audio_b64 = await text_to_speech_base64(opening_text)

        await websocket.send_json({
            "type": "question",
            "content": opening_text,
            "audio_b64": audio_b64,
            "turn": 0,
            "max_turns": active.max_turns,
            "is_last": False,
        })

        while True:
            raw = await websocket.receive_text()
            try:
                msg = WSIncomingMessage(**json.loads(raw))
            except Exception:
                await websocket.send_json({"type": "error", "content": "Invalid message format."})
                continue

            if msg.type == "ping":
                await websocket.send_json({"type": "pong", "content": ""})
                continue

            if msg.type == "end_session":
                active.is_complete = True
                break

            if msg.type == "answer":
                if not msg.content.strip():
                    await websocket.send_json({"type": "error", "content": "Please provide your answer."})
                    continue

                active.add_user_message(msg.content)
                is_last = active.is_session_over()

                if is_last:
                    wrap_up = (
                        "Thank you so much for your time! You've done really well. "
                        "Our team will be in touch soon. Do you have any questions for me?"
                    )
                    active.add_assistant_message(wrap_up)
                    audio_b64 = await text_to_speech_base64(wrap_up)
                    await websocket.send_json({
                        "type": "session_end",
                        "content": wrap_up,
                        "audio_b64": audio_b64,
                        "turn": active.current_turn,
                        "max_turns": active.max_turns,
                        "is_last": True,
                    })
                    break

                ai_response = await get_interviewer_response(
                    conversation_history=active.conversation_history,
                    company_key=active.company_key,
                    interview_type=active.interview_type,
                    role=active.role,
                    experience_level=active.experience_level,
                    current_turn=active.current_turn,
                    max_turns=active.max_turns,
                )
                active.add_assistant_message(ai_response)
                audio_b64 = await text_to_speech_base64(ai_response)

                msg_type = "follow_up" if active.current_turn > 1 else "question"
                await websocket.send_json({
                    "type": msg_type,
                    "content": ai_response,
                    "audio_b64": audio_b64,
                    "turn": active.current_turn,
                    "max_turns": active.max_turns,
                    "is_last": False,
                })

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error in {session_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "content": "An error occurred."})
        except Exception:
            pass
    finally:
        ended = end_session(session_id)
        if ended and ended.current_turn > 0:
            try:
                db_record_res = db.table("interview_sessions").select("*").eq("id", ended.db_session_id).execute()
                if db_record_res.data:
                    update_data = {
                        "conversation_history": ended.conversation_history,
                        "total_turns": ended.current_turn,
                        "status": "completed" if ended.is_complete else "abandoned"
                    }
                    if ended.is_complete:
                        update_data["ended_at"] = datetime.now(timezone.utc).isoformat()
                    db.table("interview_sessions").update(update_data).eq("id", ended.db_session_id).execute()
            except Exception as e:
                logger.error(f"Failed to save session: {e}")


@router.post("/session/{db_session_id}/end", response_model=SessionFeedbackResponse)
async def end_and_evaluate(
    db_session_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    res_s = db.table("interview_sessions").select("*").eq("id", db_session_id).eq("user_id", current_user["id"]).execute()
    if not res_s.data:
        raise HTTPException(404, "Session not found")
        
    db_record = res_s.data[0]

    if db_record.get("status") == "active" or not db_record.get("session_feedback"):
        from services.interviewer.gpt_interviewer import generate_session_feedback
        feedback = await generate_session_feedback(
            conversation_history=db_record.get("conversation_history") or [],
            company_key=db_record.get("company") or "generic",
        )
        update_data = {
            "session_feedback": feedback,
            "overall_score": feedback.get("overall_score", 50),
            "status": "completed",
            "ended_at": datetime.now(timezone.utc).isoformat()
        }
        res_u = db.table("interview_sessions").update(update_data).eq("id", db_session_id).execute()
        db_record = res_u.data[0]

    return _build_feedback_response(db_record)


@router.get("/session/{db_session_id}/feedback", response_model=SessionFeedbackResponse)
def get_session_feedback(
    db_session_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    res_s = db.table("interview_sessions").select("*").eq("id", db_session_id).eq("user_id", current_user["id"]).execute()
    if not res_s.data:
        raise HTTPException(404, "Session not found")
    
    db_record = res_s.data[0]
    if not db_record.get("session_feedback"):
        raise HTTPException(404, "Feedback not yet generated.")
        
    return _build_feedback_response(db_record)


@router.get("/sessions", response_model=list[SessionListItem])
def list_sessions(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    res_s = db.table("interview_sessions").select("*").eq("user_id", current_user["id"]).order("started_at", desc=True).limit(20).execute()
    return res_s.data


def _build_feedback_response(db_record: dict) -> SessionFeedbackResponse:
    fb = db_record.get("session_feedback") or {}
    return SessionFeedbackResponse(
        db_session_id=str(db_record["id"]),
        overall_score=db_record.get("overall_score") or 0,
        summary=fb.get("summary", ""),
        top_wins=[{"point": w.get("point", ""), "example": w.get("example", "")} for w in fb.get("top_wins", [])],
        top_improvements=[{"point": i.get("point", ""), "suggestion": i.get("suggestion", "")} for i in fb.get("top_improvements", [])],
        delivery_notes=fb.get("delivery_notes", ""),
        interview_ready=fb.get("interview_ready", False),
        total_turns=db_record.get("total_turns") or 0,
        duration_seconds=db_record.get("duration_seconds") or 0,
        created_at=db_record.get("started_at"),
    )
