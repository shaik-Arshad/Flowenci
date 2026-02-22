import json
import os
import sys
import uuid
from pathlib import Path
from datetime import datetime, timezone

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import supabase as db

def seed():
    # Check if we already have questions
    res = db.table("questions").select("id", count="exact").limit(1).execute()
    if res.count > 0:
        print("Questions already seeded. Skipping.")
        return
        
    seeds_dir = Path(__file__).parent
    json_path = seeds_dir / "questions.json"
    
    if not json_path.exists():
        print(f"Error: Could not find {json_path}")
        return
        
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    questions_data = data if isinstance(data, list) else data.get("questions", [])
    if not questions_data:
        print("No questions found in JSON file.")
        return
        
    print(f"Seeding {len(questions_data)} questions via Supabase REST API...")
    
    questions_to_insert = []
    for q in questions_data:
        question = {
            "id": str(uuid.uuid4()),
            "text": q.get("text"),
            "category": q.get("category", "behavioral"),
            "difficulty": q.get("difficulty", "medium"),
            "use_star": q.get("use_star", False),
            "guidance": q.get("guidance", ""),
            "target_duration_min": q.get("target_duration_min", 60),
            "target_duration_max": q.get("target_duration_max", 120),
            "tags": str(q.get("tags", [])) if q.get("tags") else "[]",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        questions_to_insert.append(question)
        
    # Batch insert
    res = db.table("questions").insert(questions_to_insert).execute()
    if res.data:
        print(f"DONE: Seeded {len(res.data)} questions successfully.")
    else:
        print("ERROR: Failed to seed questions.")
    
if __name__ == "__main__":
    seed()
