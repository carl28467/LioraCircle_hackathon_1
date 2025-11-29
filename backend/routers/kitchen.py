from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from backend.core.database import supabase

router = APIRouter(
    prefix="/kitchen",
    tags=["kitchen"],
    responses={404: {"description": "Not found"}},
)

class InventoryItemBase(BaseModel):
    name: str
    category: str # 'fridge', 'pantry', 'freezer'
    quantity: str
    expiry_date: str
    status: str = 'good' # 'good', 'expiring', 'expired'

class InventoryItemCreate(InventoryItemBase):
    user_id: str
    family_id: Optional[str] = None

class InventoryItem(InventoryItemBase):
    id: str
    user_id: str
    family_id: Optional[str] = None
    created_at: str

@router.get("/inventory/{user_id}", response_model=List[InventoryItem])
async def get_inventory(user_id: str):
    try:
        # First get the user's family_id
        user_response = supabase.table("profiles").select("family_id").eq("id", user_id).single().execute()
        family_id = user_response.data.get("family_id")

        if family_id:
            response = supabase.table("inventory_items").select("*").eq("family_id", family_id).execute()
        else:
            response = supabase.table("inventory_items").select("*").eq("user_id", user_id).execute()
            
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/inventory", response_model=InventoryItem)
async def add_item(item: InventoryItemCreate):
    try:
        # If family_id is not provided, try to fetch it
        if not item.family_id:
             user_response = supabase.table("profiles").select("family_id").eq("id", item.user_id).single().execute()
             item.family_id = user_response.data.get("family_id")

        data = item.dict()
        response = supabase.table("inventory_items").insert(data).execute()
        if not response.data:
             raise HTTPException(status_code=400, detail="Failed to create item")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/inventory/{item_id}")
async def delete_item(item_id: str):
    try:
        response = supabase.table("inventory_items").delete().eq("id", item_id).execute()
        return {"message": "Item deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/inventory/{item_id}", response_model=InventoryItem)
async def update_item(item_id: str, item: InventoryItemBase):
    try:
        response = supabase.table("inventory_items").update(item.dict()).eq("id", item_id).execute()
        if not response.data:
             raise HTTPException(status_code=404, detail="Item not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
