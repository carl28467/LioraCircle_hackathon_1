from typing import Dict, Any, List

class DashboardService:
    async def get_user_dashboard(self, user_id: str) -> Dict[str, Any]:
        # Fetch latest vitals from DB
        from backend.core.database import supabase
        
        # Default values
        vitals = {
            "heart_rate": {"value": "--", "unit": "BPM", "trend": "No data"},
            "spo2": {"value": "--", "unit": "%", "trend": "No data"},
            "steps": {"value": 0, "goal": 10000},
            "sleep": {"value": "--", "trend": "No data"},
            "calories": {"value": 0, "left": 2000}
        }
        
        try:
            # Get latest for each type
            # Note: In a real app, we'd do a more complex query or aggregation. 
            # Here we just get the absolute latest record for each type.
            for v_type in ["heart_rate", "spo2", "steps", "sleep", "calories"]:
                try:
                    res = supabase.table("vitals") \
                        .select("*") \
                        .eq("user_id", user_id) \
                        .eq("type", v_type) \
                        .order("recorded_at", desc=True) \
                        .limit(1) \
                        .execute()
                    
                    if res.data:
                        latest = res.data[0]
                        vitals[v_type]["value"] = latest["value"]
                        vitals[v_type]["unit"] = latest["unit"]
                        # Trend logic would go here (comparing to previous record)
                        vitals[v_type]["trend"] = "Updated just now"
                except Exception:
                    # If table doesn't exist or other DB error, just skip this vital
                    continue
                    
        except Exception as e:
            print(f"Error fetching vitals: {e}")

        return {
            "vitals": vitals,
            "medications": [
                {"id": 1, "name": "Metformin", "dose": "500mg", "time": "8:00 AM", "taken": True},
                {"id": 2, "name": "Vitamin D", "dose": "1000 IU", "time": "8:00 AM", "taken": True},
                {"id": 3, "name": "Lisinopril", "dose": "10mg", "time": "8:00 PM", "taken": False},
            ],
            "routines": [
                {"id": 1, "name": "Morning Yoga", "time": "7:00 AM", "completed": True},
                {"id": 2, "name": "Evening Walk", "time": "6:00 PM", "completed": False},
            ]
        }

    async def get_family_dashboard(self, family_id: str) -> Dict[str, Any]:
        # Mock data for now
        return {
            "family_members": [
                {"id": 1, "name": "Dad", "initial": "D", "status": "good", "mood": "😊", "color": "border-green-500"},
                {"id": 2, "name": "Mom", "initial": "M", "status": "warning", "mood": "😐", "color": "border-yellow-500"},
                {"id": 3, "name": "Sarah", "initial": "S", "status": "good", "mood": "😄", "color": "border-green-500"},
                {"id": 4, "name": "Mike", "initial": "M", "status": "danger", "mood": "😓", "color": "border-red-500"},
            ],
            "overall_vibe": "Balanced",
            "alerts": [
                {"id": 1, "type": "warning", "message": "Mom's glucose slightly high", "time": "10m ago"},
                {"id": 2, "type": "info", "message": "Dad completed morning workout", "time": "1h ago"},
            ]
        }

dashboard_service = DashboardService()
