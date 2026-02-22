"""
Feedback routes.
Trigger AI analysis + retrieve results + compare attempts.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from supabase import Client
from typing import Optional
from pathlib import Path
import uuid
from datetime import datetime, timezone

from database import get_db
from utils.jwt import get_current_user

router = APIRouter(prefix="/feedback", tags=["Feedback"])


def _run_analysis_task(recording_id: str, db: Client):
    """Background task: run full AI analysis and save to DB."""
    res_r = db.table("recordings").select("*").eq("id", recording_id).execute()
    if not res_r.data:
        return

    recording = res_r.data[0]
    
    db.table("recordings").update({
        "analysis_status": "processing",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", recording_id).execute()

    try:
        from services.storage import get_audio_file_path, delete_audio_file, get_upload_path
        from services.analysis.orchestrator import run_full_analysis

        file_path = str(get_audio_file_path(recording["s3_key"]))

        use_star = False
        question_text = ""
        if recording.get("question_id"):
            res_q = db.table("questions").select("*").eq("id", recording["question_id"]).execute()
            if res_q.data:
                question = res_q.data[0]
                use_star = question.get("use_star", False)
                question_text = question.get("text", "")

        result = run_full_analysis(
            audio_path=file_path,
            use_star=use_star,
            question_text=question_text,
        )

        db.table("recordings").update({
            "transcript": result["transcript"],
            "duration_seconds": result["duration_seconds"],
            "transcription_status": "done",
            "analysis_status": "done",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", recording_id).execute()

        feedback_dict = {
            "id": str(uuid.uuid4()),
            "recording_id": recording_id,
            "filler_word_count": result["filler_word_count"],
            "filler_words_detail": result["filler_words_detail"],
            "words_per_minute": result["words_per_minute"],
            "total_word_count": result["total_word_count"],
            "pause_count": result["pause_count"],
            "star_score": result["star_score"],
            "star_breakdown": result["star_breakdown"],
            "pronunciation_issues": result["pronunciation_issues"],
            "confidence_score": result["confidence_score"],
            "confidence_flags": result["confidence_flags"],
            "readiness_score": result["readiness_score"],
            "coaching_tips": result["coaching_tips"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.table("feedbacks").insert(feedback_dict).execute()

        from services.storage import delete_audio_file
        delete_audio_file(recording["s3_key"])

    except Exception as e:
        db.table("recordings").update({
            "analysis_status": "failed",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", recording_id).execute()
        print(f"[ERROR] Analysis failed for recording {recording_id}: {e}")


@router.post("/analyze")
async def trigger_analysis(
    recording_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    res_r = db.table("recordings").select("*").eq("id", recording_id).eq("user_id", current_user["id"]).execute()
    if not res_r.data:
        raise HTTPException(404, "Recording not found")
        
    recording = res_r.data[0]
    if recording.get("analysis_status") == "processing":
        raise HTTPException(409, "Analysis already in progress")
    if recording.get("analysis_status") == "done":
        raise HTTPException(409, "Analysis already completed")

    background_tasks.add_task(_run_analysis_task, recording_id, db)

    return {
        "recording_id": recording_id,
        "status": "processing",
        "message": "Analysis started. Poll GET /feedback/{recording_id} for results.",
    }


@router.get("/{recording_id}")
def get_feedback(
    recording_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    res_r = db.table("recordings").select("analysis_status").eq("id", recording_id).eq("user_id", current_user["id"]).execute()
    if not res_r.data:
        raise HTTPException(404, "Recording not found")
        
    recording = res_r.data[0]

    if recording.get("analysis_status") != "done":
        return {
            "recording_id": recording_id,
            "status": recording.get("analysis_status"),
            "feedback": None,
        }

    res_fb = db.table("feedbacks").select("*").eq("recording_id", recording_id).execute()
    if not res_fb.data:
        raise HTTPException(404, "Feedback not found")
        
    feedback = res_fb.data[0]

    return {
        "recording_id": recording_id,
        "status": "done",
        "feedback": {
            "id": str(feedback["id"]),
            "filler_word_count": feedback.get("filler_word_count"),
            "filler_words_detail": feedback.get("filler_words_detail"),
            "words_per_minute": feedback.get("words_per_minute"),
            "total_word_count": feedback.get("total_word_count"),
            "pause_count": feedback.get("pause_count"),
            "star_score": feedback.get("star_score"),
            "star_breakdown": feedback.get("star_breakdown"),
            "pronunciation_issues": feedback.get("pronunciation_issues"),
            "confidence_score": feedback.get("confidence_score"),
            "confidence_flags": feedback.get("confidence_flags"),
            "readiness_score": feedback.get("readiness_score"),
            "coaching_tips": feedback.get("coaching_tips"),
            "created_at": feedback.get("created_at"),
        },
    }


@router.get("/compare/{question_id}")
def compare_attempts(
    question_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    res_rec = db.table("recordings").select("*").eq("user_id", current_user["id"]).eq("question_id", question_id).eq("analysis_status", "done").order("created_at").execute()
    recordings = res_rec.data

    if len(recordings) < 2:
        raise HTTPException(400, "Need at least 2 completed attempts to compare")

    first = recordings[0]
    latest = recordings[-1]

    def get_fb(rec_id):
        res = db.table("feedbacks").select("*").eq("recording_id", rec_id).execute()
        return res.data[0] if res.data else None

    first_fb = get_fb(first["id"])
    latest_fb = get_fb(latest["id"])
    if not first_fb or not latest_fb:
        raise HTTPException(404, "Feedback not found for one or both attempts")

    filler_delta = first_fb.get("filler_word_count", 0) - latest_fb.get("filler_word_count", 0)
    filler_pct = round((filler_delta / max(first_fb.get("filler_word_count", 0), 1)) * 100)
    readiness_delta = (latest_fb.get("readiness_score", 0)) - (first_fb.get("readiness_score", 0))

    if filler_pct >= 50:
        summary = f"🎉 {filler_pct}% fewer filler words — massive improvement!"
    elif filler_pct >= 20:
        summary = f"✅ {filler_pct}% fewer filler words — good progress!"
    elif filler_pct < 0:
        summary = "Filler words increased — focus on pausing instead of filling."
    else:
        summary = "Similar filler count — keep drilling on silent pauses."

    return {
        "question_id": question_id,
        "total_attempts": len(recordings),
        "first_attempt": {
            "attempt_number": first.get("attempt_number"),
            "filler_count": first_fb.get("filler_word_count"),
            "wpm": first_fb.get("words_per_minute"),
            "readiness_score": first_fb.get("readiness_score"),
        },
        "latest_attempt": {
            "attempt_number": latest.get("attempt_number"),
            "filler_count": latest_fb.get("filler_word_count"),
            "wpm": latest_fb.get("words_per_minute"),
            "readiness_score": latest_fb.get("readiness_score"),
        },
        "improvements": {
            "filler_reduction": filler_delta,
            "filler_reduction_pct": filler_pct,
            "readiness_gain": round(readiness_delta, 1),
        },
        "summary": summary,
    }
