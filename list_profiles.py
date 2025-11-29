import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase = create_client(url, key)

print("--- ALL PROFILES ---")
profiles = supabase.table("profiles").select("*").execute()
print(f"Total profiles: {len(profiles.data)}")
for p in profiles.data:
    print(f"ID: {p['id']}")
    print(f"Name: {p.get('full_name')}")
    print(f"Role: {p.get('profile_data', {}).get('role')}")
    print(f"FamilyID: {p.get('family_id')}")
    print("-" * 20)
