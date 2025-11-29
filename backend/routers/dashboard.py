from fastapi import APIRouter, HTTPException
from backend.services.dashboard_service import dashboard_service

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)

@router.get("/user/{user_id}")
async def get_user_dashboard(user_id: str):
    try:
        return await dashboard_service.get_user_dashboard(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/family/{family_id}")
async def get_family_dashboard(family_id: str):
    try:
        return await dashboard_service.get_family_dashboard(family_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
