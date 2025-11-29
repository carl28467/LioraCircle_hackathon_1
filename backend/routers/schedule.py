from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from backend.core.database import supabase
from datetime import date

router = APIRouter(
    prefix="/schedules",
    tags=["schedules"],
    responses={404: {"description": "Not found"}},
)

class ScheduleItem(BaseModel):
    id: str
    title: str
    time: str
    type: str
    status: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None # profile_id
    date: str # YYYY-MM-DD
    family_id: str
    created_at: str
    
    # Frontend helper
    member: Optional[Dict[str, Any]] = None 

class ScheduleCreate(BaseModel):
    title: str
    time: str
    type: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    date: str
    family_id: str

class ScheduleUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None
    time: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None

@router.get("/{family_id}", response_model=List[ScheduleItem])
async def get_schedules(
    family_id: str, 
    date_str: Optional[str] = Query(None, alias="date"),
    status: Optional[str] = Query(None),
    limit: Optional[int] = Query(None)
):
    # Select schedules and join with profiles to get assignee name
    query = supabase.table("schedules").select("*, profiles:assigned_to(full_name, profile_data)").eq("family_id", family_id)
    
    if date_str:
        query = query.eq("date", date_str)
    
    if status:
        query = query.eq("status", status)
        
    # Sort by date and time descending for history (most recent first)
    # For daily view, we might want ascending, but let's handle that in frontend or add a sort param.
    # Defaulting to descending for now as it fits history better, and daily view sorts in frontend.
    query = query.order("date", desc=True).order("time", desc=True)
    
    if limit:
        query = query.limit(limit)
        
    response = query.execute()
    
    schedules = []
    for item in response.data:
        member_info = None
        profile = item.get("profiles")
        
        if profile:
            color = "bg-blue-500"
            if profile.get("profile_data") and isinstance(profile["profile_data"], dict):
                color = profile["profile_data"].get("color", "bg-blue-500")
                
            member_info = {
                "name": profile.get("full_name") or "Unknown",
                "color": color
            }
        else:
            member_info = {
                "name": "Family",
                "color": "bg-purple-500"
            }
            
        item["member"] = member_info
        schedules.append(item)
        
    return schedules

@router.post("/", response_model=ScheduleItem)
async def create_schedule(schedule: ScheduleCreate):
    response = supabase.table("schedules").insert(schedule.dict()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create schedule")
    
    # We need to return the item with member info. 
    # For a newly created item, we can just fetch it again or construct the response.
    # Let's construct it to save a round trip if possible, but we need the profile name.
    created_item = response.data[0]
    
    member_info = {"name": "Family", "color": "bg-purple-500"}
    if schedule.assigned_to:
        # Fetch profile name
        prof_res = supabase.table("profiles").select("full_name, profile_data").eq("id", schedule.assigned_to).single().execute()
        if prof_res.data:
            color = "bg-blue-500"
            if prof_res.data.get("profile_data") and isinstance(prof_res.data["profile_data"], dict):
                color = prof_res.data["profile_data"].get("color", "bg-blue-500")
            member_info = {
                "name": prof_res.data.get("full_name"),
                "color": color
            }
            
    created_item["member"] = member_info
    return created_item

@router.patch("/{schedule_id}", response_model=ScheduleItem)
async def update_schedule(schedule_id: str, update: ScheduleUpdate):
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    
    response = supabase.table("schedules").update(update_data).eq("id", schedule_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    updated_item = response.data[0]
    
    # Re-fetch or reconstruct member info
    member_info = {"name": "Family", "color": "bg-purple-500"}
    assigned_to = updated_item.get("assigned_to")
    if assigned_to:
         prof_res = supabase.table("profiles").select("full_name, profile_data").eq("id", assigned_to).single().execute()
         if prof_res.data:
            color = "bg-blue-500"
            if prof_res.data.get("profile_data") and isinstance(prof_res.data["profile_data"], dict):
                color = prof_res.data["profile_data"].get("color", "bg-blue-500")
            member_info = {
                "name": prof_res.data.get("full_name"),
                "color": color
            }
            
    updated_item["member"] = member_info
    return updated_item
