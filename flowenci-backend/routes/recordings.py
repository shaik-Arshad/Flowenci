"""
Recording upload route.
Accepts audio file -> saves locally -> creates Recording DB record.
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from supabase import Client
from typing import Optional
import uuid
from datetime import datetime, timezone

from database import get_db
from services.storage import save_audio_file as save_audio
from utils.jwt import get_current_user

router = APIRouter(prefix="/recordings", tags=["Recordings"])

ALLOWED_AUDIO_TYPES = {
    "audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg",
    "audio/wav", "audio/x-m4a", "audio/aac",
}
MAX_FILE_SIZE_MB = 25


@router.post("/upload")
async def upload_recording(
    file: UploadFile = File(...),
    question_id: Optional[str] = Form(None),
    attempt_number: int = Form(1),
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    if file.content_type and file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(400, f"Unsupported audio format: {file.content_type}")

    question = None
    if question_id:
        res_q = db.table("questions").select("*").eq("id", question_id).execute()
        if not res_q.data:
            raise HTTPException(404, "Question not found")
        question = res_q.data[0]

    storage_result = await save_audio(file, str(current_user["id"]))

    rec_dict = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "question_id": question["id"] if question else None,
        "s3_key": storage_result["filename"],
        "attempt_number": attempt_number,
        "transcription_status": "pending",
        "analysis_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    res_r = db.table("recordings").insert(rec_dict).execute()
    if not res_r.data:
        raise HTTPException(500, "Failed to save recording to database")
    recording = res_r.data[0]

    return {
        "recording_id": str(recording["id"]),
        "file_key": storage_result["filename"],
        "size_kb": round(storage_result["size_bytes"] / 1024, 1),
        "message": "Upload successful. Call /feedback/analyze to start AI analysis.",
    }


@router.get("/{recording_id}")
def get_recording(
    recording_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    res_r = db.table("recordings").select("*").eq("id", recording_id).eq("user_id", current_user["id"]).execute()
    if not res_r.data:
        raise HTTPException(404, "Recording not found")
    
    recording = res_r.data[0]

    return {
        "id": str(recording["id"]),
        "question_id": str(recording["question_id"]) if recording.get("question_id") else None,
        "duration_seconds": recording.get("duration_seconds"),
        "attempt_number": recording.get("attempt_number"),
        "analysis_status": recording.get("analysis_status"),
        "created_at": recording.get("created_at"),
    }
