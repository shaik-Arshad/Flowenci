"""
Session manager — in-memory active interview sessions.
"""
import uuid
from typing import Optional, Dict, List
from dataclasses import dataclass, field


@dataclass
class ActiveSession:
    session_id: str
    user_id: str
    company_key: str
    interview_type: str
    role: str
    experience_level: str
    max_turns: int
    current_turn: int = 0
    conversation_history: List[Dict] = field(default_factory=list)
    is_complete: bool = False
    db_session_id: str = ""

    def add_assistant_message(self, content: str):
        self.conversation_history.append({"role": "assistant", "content": content})
        self.current_turn += 1

    def add_user_message(self, content: str):
        self.conversation_history.append({"role": "user", "content": content})

    def is_session_over(self) -> bool:
        return self.current_turn >= self.max_turns


# In-memory store: session_id -> ActiveSession
_active_sessions: Dict[str, ActiveSession] = {}


def create_session(
    user_id: str,
    company_key: str,
    interview_type: str,
    role: str,
    experience_level: str,
    max_turns: int,
) -> ActiveSession:
    session_id = str(uuid.uuid4())
    session = ActiveSession(
        session_id=session_id,
        user_id=user_id,
        company_key=company_key,
        interview_type=interview_type,
        role=role,
        experience_level=experience_level or "student",
        max_turns=max_turns,
    )
    _active_sessions[session_id] = session
    return session


def get_session(session_id: str) -> Optional[ActiveSession]:
    return _active_sessions.get(session_id)


def end_session(session_id: str) -> Optional[ActiveSession]:
    return _active_sessions.pop(session_id, None)
