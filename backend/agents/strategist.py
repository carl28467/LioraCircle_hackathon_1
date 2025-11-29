from typing import Dict, Any, Optional, List
import json
from datetime import datetime, timedelta
from ..core.llm import llm_client
from ..core.database import supabase

class StrategistAgent:
    def __init__(self):
        self.system_instruction = """
        You are The Strategist, a specialized agent within Liora responsible for managing family schedules and routines.
        Your goal is to help users organize their time efficiently.
        
        When a user asks to add a schedule, routine, or appointment, your job is to:
        1. Extract the key details: title, time, type (routine, medication, appointment, exercise), date, and assignee.
        2. If the date is relative (e.g., "tomorrow", "next Monday"), calculate the actual date based on the current date provided in the context.
        3. Return a JSON object with the extracted details.
        
        The JSON structure should be:
        {
            "action": "create_schedule",
            "data": {
                "title": "Task Title",
                "time": "HH:MM" (24-hour format),
                "type": "routine" | "medication" | "appointment" | "exercise",
                "date": "YYYY-MM-DD",
                "assigned_to_name": "Name" (or "family" if not specified)
            },
            "response": "A natural language confirmation message to the user."
        }
        
        If you cannot extract all necessary information, ask for clarification in the "response" field and set "action" to "clarify".
        """

    async def process_message(self, message: str, context: Dict[str, Any], attachments: Optional[List[Dict[str, str]]] = None) -> str:
        # Add current date to context for the LLM
        current_date = datetime.now().strftime("%Y-%m-%d")
        day_name = datetime.now().strftime("%A")
        
        prompt = f"""
        Current Date: {current_date} ({day_name})
        User Message: {message}
        
        Extract the schedule details and return the JSON.
        """
        
        try:
            response_text = await llm_client.generate_response(prompt, system_instruction=self.system_instruction)
            
            # Clean up response to ensure it's valid JSON
            response_text = response_text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            try:
                parsed_response = json.loads(response_text)
            except json.JSONDecodeError:
                # Fallback if LLM doesn't return valid JSON
                return response_text

            if parsed_response.get("action") == "create_schedule":
                data = parsed_response.get("data")
                family_id = context.get("profile", {}).get("family_id")
                
                if not family_id:
                    return "I can't add that to the schedule because I don't know which family you belong to."

                # Resolve assignee
                assigned_to_id = None
                if data.get("assigned_to_name") and data["assigned_to_name"].lower() != "family":
                    # Try to find member by name or role
                    # Fetch family members with profile_data to check for roles/nicknames
                    members_res = supabase.table("profiles").select("id, full_name, profile_data").eq("family_id", family_id).execute()
                    
                    if members_res.data:
                        target_name = data["assigned_to_name"].lower()
                        for m in members_res.data:
                            # Check full name
                            if target_name in m["full_name"].lower():
                                assigned_to_id = m["id"]
                                break
                            
                            # Check profile_data for role or relation
                            p_data = m.get("profile_data", {})
                            if isinstance(p_data, dict):
                                role = p_data.get("role", "").lower()
                                relation = p_data.get("relation", "").lower()
                                if target_name == role or target_name == relation:
                                    assigned_to_id = m["id"]
                                    break
                
                new_schedule = {
                    "title": data["title"],
                    "time": data["time"],
                    "type": data["type"],
                    "date": data["date"],
                    "family_id": family_id,
                    "assigned_to": assigned_to_id,
                    "status": "pending"
                }
                
                # Insert into Supabase
                res = supabase.table("schedules").insert(new_schedule).execute()
                
                if res.data:
                    return parsed_response.get("response", "Done! I've added that to the schedule.")
                else:
                    return "I tried to add that to the schedule, but something went wrong."
            
            elif parsed_response.get("action") == "clarify":
                return parsed_response.get("response")
            
            else:
                # If action is unknown or missing, just return the response text (fallback)
                return parsed_response.get("response", response_text)

        except Exception as e:
            print(f"Strategist Error: {e}")
            return "I'm having a bit of trouble processing that request right now."

strategist_agent = StrategistAgent()
