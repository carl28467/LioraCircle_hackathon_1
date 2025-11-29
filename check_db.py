import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase = create_client(url, key)

print("--- LATEST PROFILES ---")
profiles = supabase.table("profiles").select("*").order("updated_at", desc=True).limit(5).execute()
for p in profiles.data:
    print(f"ID: {p['id']}, Name: {p.get('full_name')}, Role: {p.get('profile_data', {}).get('role')}, FamilyID: {p.get('family_id')}")

print("\n--- LATEST FAMILIES ---")
families = supabase.table("families").select("*").order("created_at", desc=True).limit(5).execute()
for f in families.data:
    print(f"ID: {f['id']}, Name: {f['name']}, Code: {f['invite_code']}, PioneerID: {f['pioneer_id']}")
