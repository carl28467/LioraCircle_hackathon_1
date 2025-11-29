import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Supabase URL and Key must be set in environment variables")

supabase: Client = create_client(url, key)

def get_supabase_client(access_token: str = None) -> Client:
    client = create_client(url, key)
    if access_token:
        client.auth.set_session(access_token, "dummy_refresh_token")
    return client
