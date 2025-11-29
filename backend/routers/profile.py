from fastapi import APIRouter, HTTPException, Depends
from backend.core.database import supabase
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter(
    prefix="/api/profile",
    tags=["profile"]
)

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_data: Optional[Dict[str, Any]] = None

@router.get("/{user_id}")
async def get_profile(user_id: str):
    try:
        # Basic UUID validation (optional but good for preventing 500s)
        import uuid
        try:
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user ID format")

        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}")
async def update_profile(user_id: str, profile: ProfileUpdate):
    try:
        data = {}
        if profile.full_name:
            data["full_name"] = profile.full_name
        if profile.profile_data:
            data["profile_data"] = profile.profile_data
            
        response = supabase.table("profiles").update(data).eq("id", user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
