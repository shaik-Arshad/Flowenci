"""
Dashboard routes — progress stats and trends.
"""
from fastapi import APIRouter, Depends
from supabase import Client
from database import get_db
from utils.jwt import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_stats(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    res_rec = db.table("recordings").select("*").eq("user_id", current_user["id"]).eq("analysis_status", "done").order("created_at").execute()
    recordings = res_rec.data

    if not recordings:
        return {
            "total_recordings": 0,
            "questions_practiced": 0,
            "total_practice_minutes": 0,
            "readiness_score": 0,
            "is_interview_ready": False,
            "filler_trend": [],
            "readiness_trend": [],
            "next_focus": "Start practicing to track your progress",
        }

    total_duration = sum(r.get("duration_seconds", 0) for r in recordings)
    unique_questions = len(set(r.get("question_id") for r in recordings if r.get("question_id")))

    # Fetch feedback for all recordings in one go
    rec_ids = [r["id"] for r in recordings]
    res_fb = db.table("feedbacks").select("*").in_("recording_id", rec_ids).execute()
    feedbacks_map = {fb["recording_id"]: fb for fb in res_fb.data}
    
    feedbacks = [feedbacks_map.get(r["id"]) for r in recordings if feedbacks_map.get(r["id"])]

    readiness_score = 0
    is_ready = False
    if feedbacks:
        readiness_score = sum(f.get("readiness_score", 0) for f in feedbacks) / len(feedbacks)
        is_ready = readiness_score >= 75

    filler_trend = []
    readiness_trend = []
    for i, rec in enumerate(recordings, 1):
        fb = feedbacks_map.get(rec["id"])
        if fb:
            filler_trend.append({"attempt": i, "filler_count": fb.get("filler_word_count", 0)})
            readiness_trend.append({"attempt": i, "score": fb.get("readiness_score", 0)})

    # Generate next focus suggestion
    last_fb = feedbacks[-1] if feedbacks else None
    next_focus = "Keep practicing!"
    if last_fb:
        if last_fb.get("filler_word_count", 0) > 10:
            next_focus = "Focus: Reduce filler words — use silent pauses instead"
        elif last_fb.get("words_per_minute") and last_fb["words_per_minute"] > 160:
            next_focus = "Focus: Slow down your pace to 120-150 WPM"
        elif last_fb.get("words_per_minute") and last_fb["words_per_minute"] < 100:
            next_focus = "Focus: Speak with more energy — aim for 120-150 WPM"
        elif last_fb.get("readiness_score", 0) < 50:
            next_focus = "Focus: Structure your answers with STAR method"
        else:
            next_focus = "Great progress! Keep practicing to reach 75+ readiness"

    return {
        "total_recordings": len(recordings),
        "questions_practiced": unique_questions,
        "total_practice_minutes": round(total_duration / 60, 1),
        "readiness_score": round(readiness_score, 1),
        "is_interview_ready": is_ready,
        "filler_trend": filler_trend[-20:],      # last 20 attempts
        "readiness_trend": readiness_trend[-20:],
        "next_focus": next_focus,
    }
