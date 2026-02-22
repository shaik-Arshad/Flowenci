from fastapi import APIRouter, Depends, HTTPException, status
import uuid
from datetime import datetime, timezone
from supabase import Client
from database import get_db
from schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserResponse, UpdateProfileRequest
from utils.password import hash_password, verify_password
from utils.jwt import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Client = Depends(get_db)):
    # Check if email exists
    existing = db.table("users").select("id").eq("email", payload.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "target_companies": payload.target_companies,
        "interview_timeline": payload.interview_timeline,
        "experience_level": payload.experience_level or "student",
        "is_active": True,
        "is_paid": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    
    # Insert new user
    res = db.table("users").insert(user_dict).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create user")
        
    user = res.data[0]
    token = create_access_token({"sub": str(user["id"])})
    return TokenResponse(access_token=token, user=UserResponse(**user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Client = Depends(get_db)):
    res = db.table("users").select("*").eq("email", payload.email).execute()
    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    user = res.data[0]
    if not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account disabled")

    token = create_access_token({"sub": str(user["id"])})
    return TokenResponse(access_token=token, user=UserResponse(**user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)


@router.patch("/me", response_model=UserResponse)
def update_profile(
    payload: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    update_data = payload.model_dump(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        res = db.table("users").update(update_data).eq("id", current_user["id"]).execute()
        if res.data:
            current_user.update(res.data[0])
            
    return UserResponse(**current_user)


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
