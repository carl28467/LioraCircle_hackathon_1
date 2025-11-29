import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase = create_client(url, key)

print("--- LATEST PROFILE ---")
# Get the most recently updated profile
profile = supabase.table("profiles").select("*").order("updated_at", desc=True).limit(1).execute()
if profile.data:
    p = profile.data[0]
    print(f"ID: {p['id']}")
    print(f"Name: {p.get('full_name')}")
    print(f"FamilyID: {p.get('family_id')}")
    print(f"Role: {p.get('profile_data', {}).get('role')}")
else:
    print("No profiles found.")
