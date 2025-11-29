from fastapi import FastAPI, HTTPException, Request, Header
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

from backend.routers import dashboard, profile, family, schedule

app = FastAPI(title="Liora AI Backend", version="1.0.0")

app.include_router(dashboard.router)
app.include_router(profile.router)
app.include_router(family.router)
app.include_router(schedule.router)
from backend.routers import kitchen
app.include_router(kitchen.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    user_id: str
    context: Optional[Dict[str, Any]] = {}
    attachments: Optional[List[Dict[str, str]]] = None # [{"type": "image/png", "data": "base64..."}]

class ChatResponse(BaseModel):
    response: str
    metadata: Optional[Dict[str, Any]] = {}

@app.get("/")
async def root():
    return {"message": "Liora AI Backend is running"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, authorization: Optional[str] = Header(None)):
    try:
        token = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]

        from backend.agents.orchestrator import orchestrator
        
        # 1. Retrieve context/memory (Placeholder)
        # memories = await memory_manager.query_memory(request.user_id, request.message)
        
        # 2. Process message via Orchestrator
        response_text, updates = await orchestrator.process_message(
            message=request.message,
            user_id=request.user_id,
            context=request.context,
            message=request.message,
            user_id=request.user_id,
            context=request.context,
            attachments=request.attachments,
            token=token
        )
        
        # 3. Save to memory (Placeholder)
        # await memory_manager.add_memory(request.user_id, request.message, {"role": "user"})
        # await memory_manager.add_memory(request.user_id, response_text, {"role": "assistant"})

        # --- PERSIST UPDATES TO SUPABASE ---
        if updates:
            try:
                from backend.core.database import supabase
                update_payload = {}
                
                # Handle Family Join
                if "join_family_id" in updates:
                    update_payload["family_id"] = updates["join_family_id"]
                
                # Handle Profile Data Updates
                if "profile_data" in updates:
                    # We need to merge, but for now let's just update the JSON column
                    # Ideally we should fetch existing, merge, and save.
                    # But Supabase JSONB updates can be tricky.
                    # Let's assume the agent returns the full profile_data or we just patch it.
                    # For safety, let's just save what we got.
                    # Actually, we should probably fetch the current profile first to be safe, 
                    # but for speed let's trust the agent's output or just update the specific fields if possible.
                    # The agent returns "updates" -> "profile_data".
                    # Let's just update the profile_data column.
                    # Wait, if we overwrite, we might lose data not in the update.
                    # The agent usually returns the *new* fields.
                    # Let's fetch current first.
                    current_profile = supabase.table("profiles").select("profile_data").eq("id", request.user_id).single().execute()
                    current_data = current_profile.data.get("profile_data") or {}
                    current_data.update(updates["profile_data"])
                    update_payload["profile_data"] = current_data

                # Handle Onboarding Completion
                if "onboarding_completed" in updates:
                    update_payload["onboarding_completed"] = updates["onboarding_completed"]

                if update_payload:
                    print(f"Persisting updates for user {request.user_id}: {update_payload.keys()}")
                    supabase.table("profiles").update(update_payload).eq("id", request.user_id).execute()

            except Exception as e:
                print(f"Error persisting updates: {e}")
                # Don't fail the request, just log it
        
        return ChatResponse(
            response=response_text,
            metadata={"agent": "Dynamic", "updates": updates} 
        )
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(error_msg)
        with open("backend/error.log", "a") as f:
            f.write(f"Error processing request: {str(e)}\n{error_msg}\n")
        raise HTTPException(status_code=500, detail=str(e))

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
