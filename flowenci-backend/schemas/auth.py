from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    target_companies: Optional[str] = None
    interview_timeline: Optional[str] = None
    experience_level: Optional[str] = "student"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    experience_level: Optional[str]
    target_companies: Optional[str]
    interview_timeline: Optional[str]
    is_paid: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    target_companies: Optional[str] = None
    interview_timeline: Optional[str] = None
    experience_level: Optional[str] = None
