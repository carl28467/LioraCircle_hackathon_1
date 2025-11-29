import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Add backend to sys.path
sys.path.append(str(Path.cwd()))

# Load .env
env_path = Path.cwd() / 'backend' / '.env'
load_dotenv(dotenv_path=env_path)

print(f"LLM_PROVIDER: {os.getenv('LLM_PROVIDER')}")
print(f"PIPESHIFT_API_KEY present: {bool(os.getenv('PIPESHIFT_API_KEY'))}")

try:
    from backend.core.llm import llm_client
    print("LLMClient initialized successfully")
except Exception as e:
    print(f"LLMClient initialization failed: {e}")
