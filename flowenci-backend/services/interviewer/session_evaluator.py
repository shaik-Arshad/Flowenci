"""
Session evaluator — generates and saves end-of-session feedback.
"""
from services.interviewer.gpt_interviewer import generate_session_feedback
from datetime import datetime, timezone


async def evaluate_and_save_session(active_session, db, db_record):
    """Generate holistic session feedback and persist to DB."""
    feedback = await generate_session_feedback(
        conversation_history=active_session.conversation_history,
        company_key=active_session.company_key,
    )

    db_record.session_feedback = feedback
    db_record.overall_score = feedback.get("overall_score", 50)
    db_record.status = "completed"
    db_record.ended_at = datetime.now(timezone.utc)
    db_record.total_turns = active_session.current_turn
    db_record.conversation_history = active_session.conversation_history
    db.commit()

    return feedback
