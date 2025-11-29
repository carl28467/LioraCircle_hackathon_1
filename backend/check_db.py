import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_KEY not found.")
    exit(1)

supabase: Client = create_client(url, key)

async def check_db():
    print("--- Checking Profiles ---")
    try:
        response = supabase.table("profiles").select("id, full_name, family_id, profile_data").execute()
        for profile in response.data:
            print(f"Name: {profile.get('full_name')}, ID: {profile.get('id')}, Family ID: {profile.get('family_id')}")
            if profile.get('profile_data'):
                 print(f"  Role: {profile['profile_data'].get('role')}")
                 print(f"  Family Code (in data): {profile['profile_data'].get('family_code')}")

        print("\n--- Checking Families ---")
        fam_response = supabase.table("families").select("*").execute()
        for fam in fam_response.data:
            print(f"Family: {fam.get('name')}, ID: {fam.get('id')}, Code: {fam.get('invite_code')}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
