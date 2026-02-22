"""
Progressive coaching message — milestone messages per user based on history.
"""
from supabase import Client


def get_progressive_message(user_id: str, db: Client, latest_metrics: dict) -> str:
    """
    Generate a motivational milestone message based on the user's progress.
    """
    res = db.table("recordings").select("id", count="exact").eq("user_id", user_id).eq("analysis_status", "done").execute()
    count = res.count if res.count is not None else len(res.data)

    filler_count = latest_metrics.get("filler_word_count", 0)
    readiness = latest_metrics.get("readiness_score", 0)

    if count == 1:
        return "🎉 First recording done! Every expert was once a beginner. Keep going!"
    elif count == 5:
        return "🔥 5 recordings in! You're building a real habit. Consistency is key."
    elif count == 10:
        return "🚀 10 recordings! You're in the top 10% of serious interview preppers."
    elif readiness >= 75:
        return "✨ Readiness score above 75! You're interview-ready. Trust your preparation."
    elif filler_count <= 3:
        return "💪 Excellent — barely any filler words! Interviewers will notice your calm delivery."
    elif count % 5 == 0:
        return f"📈 {count} recordings completed! Track your trend to see how far you've come."
    else:
        return "Keep practicing — every recording makes you more confident!"
