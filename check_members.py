import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase = create_client(url, key)

# 1. Get a Pioneer
print("--- FETCHING PIONEER ---")
pioneer = supabase.table("profiles").select("*").eq("profile_data->>role", "pioneer").limit(1).execute()
if not pioneer.data:
    print("No pioneer found.")
    exit()

pioneer_user = pioneer.data[0]
family_id = pioneer_user.get("family_id")
print(f"Pioneer: {pioneer_user['id']}, Family: {family_id}")

if not family_id:
    print("Pioneer has no family_id.")
    exit()

# 2. Fetch all members of that family
print(f"\n--- FETCHING MEMBERS FOR FAMILY {family_id} ---")
members = supabase.table("profiles").select("*").eq("family_id", family_id).execute()

print(f"Found {len(members.data)} members:")
for m in members.data:
    print(f"- {m['id']} ({m.get('full_name')}) - Role: {m.get('profile_data', {}).get('role')}")
