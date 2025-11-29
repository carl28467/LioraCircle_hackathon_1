import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase = create_client(url, key)

print("--- FAMILIES ---")
families = supabase.table("families").select("*").execute()
print(f"Total families: {len(families.data)}")
for f in families.data:
    print(f"ID: {f['id']}")
    print(f"Name: {f.get('name')}")
    print(f"Code: {f.get('invite_code')}")
