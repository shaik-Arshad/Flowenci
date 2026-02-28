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

    # Fetch detailed feedback for the latest recording to get skill breakdown
    latest_rec = recordings[-1]
    latest_fb = feedbacks_map.get(latest_rec["id"])
    
    skill_breakdown = []
    last_session = None
    
    if latest_fb:
        skill_breakdown = [
            {"skill": "Communication", "value": latest_fb.get("confidence_score", 0), "color": "bg-cyan-500"},
            {"skill": "Fluency", "value": max(0, 100 - (latest_fb.get("filler_word_count", 0) * 5)), "color": "bg-amber-500"},
            {"skill": "Grammar Accuracy", "value": latest_fb.get("readiness_score", 0), "color": "bg-teal-500"},
            {"skill": "Vocabulary Range", "value": min(100, latest_fb.get("total_word_count", 0) / 2), "color": "bg-red-500"},
            {"skill": "Confidence Score", "value": latest_fb.get("confidence_score", 0), "color": "bg-cyan-400"},
        ]
        
        last_session = {
            "score": latest_fb.get("readiness_score", 0),
            "change": f"+{round(readiness_score - feedbacks[0].get('readiness_score', 0), 1)}" if len(feedbacks) > 1 else "0",
            "strengths": latest_fb.get("coaching_tips", [])[:3] if isinstance(latest_fb.get("coaching_tips"), list) else ["Good progress"],
            "improvements": latest_fb.get("confidence_flags", [])[:3] if isinstance(latest_fb.get("confidence_flags"), list) else ["Continue practicing"]
        }

    # Mock/Calculate additional fields for enhanced dashboard
    # In a real app, these might come from a 'user_profiles' or 'user_stats' table
    return {
        "track": "Product Management Track",
        "overall_progress": 67,
        "weekly_change": "+12%",
        "total_recordings": len(recordings),
        "questions_practiced": unique_questions,
        "total_practice_minutes": round(total_duration / 60, 1),
        "readiness_score": round(readiness_score, 1),
        "is_interview_ready": is_ready,
        "filler_trend": filler_trend[-20:],      # last 20 attempts
        "readiness_trend": readiness_trend[-20:],
        "next_focus": next_focus,
        "skill_breakdown": skill_breakdown,
        "last_session": last_session,
        "latest_recording_id": latest_rec["id"],
        "today_tasks": [
            {"text": "Complete vocabulary drill (5 mins)", "completed": False},
            {"text": "Practice STAR framework responses", "completed": True},
            {"text": "Review last session feedback", "completed": False}
        ],
        "next_milestone": "Complete 10 mock interviews",
        "milestone_progress": min(100, (len(recordings) / 10) * 100),
        "gamification": {
            "streak": 7,
            "xp": 2847,
            "level": 12,
            "next_level_progress": 73
        },
        "avg_speaking_speed": round(sum(f.get("words_per_minute", 0) for f in feedbacks) / len(feedbacks), 1) if feedbacks else 0,
        "avg_filler_words": round(sum(f.get("filler_word_count", 0) for f in feedbacks) / len(feedbacks), 1) if feedbacks else 0,
        "sessions_this_week": len([r for r in recordings if "2026-02" in r.get("created_at", "")]), # Generic check for this month
        "ai_suggestions": [
            "Focus on behavioral questions",
            "Practice leadership scenarios",
            "Improve storytelling",
            "Work on technical depth"
        ]
    }
