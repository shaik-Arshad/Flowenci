"""
Questions routes — list, filter, search, and get individual questions.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from supabase import Client
from database import get_db
from utils.jwt import get_current_user
from collections import Counter

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.get("")
def list_questions(
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    use_star: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    req = db.table("questions").select("*", count="exact").eq("is_active", True)

    if category:
        req = req.eq("category", category)
    if difficulty:
        req = req.eq("difficulty", difficulty)
    if use_star is not None:
        req = req.eq("use_star", use_star)
    if search:
        req = req.ilike("text", f"%{search}%")

    req = req.range(offset, offset + limit - 1)
    res = req.execute()

    questions = res.data
    total = res.count if res.count is not None else len(questions)

    return {
        "total": total,
        "questions": [
            {
                "id": str(q["id"]),
                "text": q["text"],
                "category": q["category"],
                "difficulty": q["difficulty"],
                "use_star": q["use_star"],
                "guidance": q.get("guidance"),
                "target_duration_min": q.get("target_duration_min"),
                "target_duration_max": q.get("target_duration_max"),
                "tags": q.get("tags"),
            }
            for q in questions
        ],
    }

@router.get("/categories")
def get_categories(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    # Fetch all active categories and compute counts in python, since Supabase PostgREST doesn't support GROUP BY natively yet
    res = db.table("questions").select("category").eq("is_active", True).execute()
    counts = Counter(q["category"] for q in res.data if q.get("category"))
    return [{"category": cat, "count": count} for cat, count in counts.items()]

@router.get("/{question_id}")
def get_question(
    question_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    res = db.table("questions").select("*").eq("id", question_id).eq("is_active", True).execute()
    if not res.data:
        raise HTTPException(404, "Question not found")
        
    question = res.data[0]
    return {
        "id": str(question["id"]),
        "text": question["text"],
        "category": question["category"],
        "difficulty": question["difficulty"],
        "use_star": question["use_star"],
        "guidance": question.get("guidance"),
        "target_duration_min": question.get("target_duration_min"),
        "target_duration_max": question.get("target_duration_max"),
        "tags": question.get("tags"),
    }
