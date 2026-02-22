from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
import uuid


class StartSessionRequest(BaseModel):
    company_key: str = "generic"
    interview_type: str = "behavioral"
    role: str = "Software Engineer"
    max_turns: int = 8


class StartSessionResponse(BaseModel):
    session_id: str
    db_session_id: str
    message: str


class WSIncomingMessage(BaseModel):
    type: str       # "answer" | "ping" | "end_session"
    content: str = ""


class WSOutgoingMessage(BaseModel):
    type: str
    content: str
    audio_b64: Optional[str] = None
    turn: Optional[int] = None
    max_turns: Optional[int] = None
    is_last: bool = False


class TopWin(BaseModel):
    point: str
    example: str


class TopImprovement(BaseModel):
    point: str
    suggestion: str


class SessionFeedbackResponse(BaseModel):
    db_session_id: str
    overall_score: float
    summary: str
    top_wins: List[TopWin]
    top_improvements: List[TopImprovement]
    delivery_notes: str
    interview_ready: bool
    total_turns: int
    duration_seconds: float
    created_at: datetime

    model_config = {"from_attributes": True}


class SessionListItem(BaseModel):
    id: str
    company: Optional[str]
    interview_type: Optional[str]
    status: str
    overall_score: Optional[float]
    total_turns: Optional[int]
    started_at: datetime

    model_config = {"from_attributes": True}
