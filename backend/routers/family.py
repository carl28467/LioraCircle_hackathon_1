from fastapi import APIRouter, HTTPException
from backend.core.database import supabase
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(
    prefix="/api/family",
    tags=["family"]
)

@router.get("/{family_id}/members")
async def get_family_members(family_id: str):
    try:
        import uuid
        try:
            uuid.UUID(family_id)
        except ValueError:
            return [] # Return empty list for invalid/placeholder IDs

        # Get all profiles associated with this family_id
        response = supabase.table("profiles").select("*").eq("family_id", family_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/code/{invite_code}")
async def get_family_by_code(invite_code: str):
    try:
        response = supabase.table("families").select("*").eq("invite_code", invite_code).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Family not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{family_id}")
async def get_family_details(family_id: str):
    try:
        response = supabase.table("families").select("*").eq("id", family_id).single().execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
