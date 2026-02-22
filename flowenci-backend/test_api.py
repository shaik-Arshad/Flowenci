from database import supabase as db
from config import get_settings

def test_api_logic():
    # Simulate list_questions filters
    req = db.table("questions").select("*", count="exact").eq("is_active", True)
    res = req.range(0, 49).execute()
    
    print(f"Status Data Count: {len(res.data)}")
    print(f"Total Count Reported: {res.count}")
    
    # Simulate get_current_user for the known user
    user_id = "9ac43835-feac-4b10-94db-a343e49e39d6" # From check_db.py output
    user_res = db.table("users").select("*").eq("id", user_id).execute()
    print(f"User check for {user_id}: Found {len(user_res.data)} users")

if __name__ == "__main__":
    test_api_logic()
