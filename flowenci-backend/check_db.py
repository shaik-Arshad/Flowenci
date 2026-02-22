from database import supabase as db

def check_data():
    # Questions check
    res = db.table("questions").select("*", count="exact").execute()
    print(f"Total Questions in DB: {res.count}")
    
    # Users check
    res_users = db.table("users").select("*", count="exact").execute()
    print(f"Total Users in DB: {res_users.count}")
    if res_users.data:
        print("First User Sample (ID and Email):")
        print(f"ID: {res_users.data[0].get('id')}, Email: {res_users.data[0].get('email')}")
    # Categories check
    unique_cats = set(q["category"] for q in res.data if "category" in q)
    print(f"Unique Categories in DB: {unique_cats}")

if __name__ == "__main__":
    check_data()
