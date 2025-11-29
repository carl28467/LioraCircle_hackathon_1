from typing import Dict, Any, Optional, List
import json
import random
from datetime import datetime, timedelta
from ..core.llm import llm_client
from ..core.database import supabase

class SimulationAgent:
    def __init__(self):
        self.system_instruction = """
        You are The Simulator, a specialized agent within Liora responsible for generating realistic mock health data for testing and demonstration purposes.
        
        When a user asks to "simulate vitals", "generate mock data", or similar, your job is to:
        1. Analyze the user's profile (age, gender, conditions) to determine appropriate ranges for vitals.
        2. Generate realistic data points for:
           - Heart Rate (bpm)
           - SpO2 (%)
           - Steps (count)
           - Sleep (hours)
           - Calories (kcal)
        3. Return a JSON object with the generated data.
        
        The JSON structure should be:
        {
            "action": "generate_vitals",
            "data": [
                { "type": "heart_rate", "value": 72, "unit": "bpm" },
                { "type": "spo2", "value": 98, "unit": "%" },
                { "type": "steps", "value": 5432, "unit": "steps" },
                { "type": "sleep", "value": 7.5, "unit": "hours" },
                { "type": "calories", "value": 1850, "unit": "kcal" }
            ],
            "response": "I've generated some fresh health data for you based on your profile."
        }
        """

    async def process_message(self, message: str, context: Dict[str, Any], attachments: Optional[List[Dict[str, str]]] = None) -> str:
        # Get user profile for context
        profile = context.get("profile", {})
        age = profile.get("profile_data", {}).get("age", "unknown")
        gender = profile.get("profile_data", {}).get("gender", "unknown")
        conditions = profile.get("profile_data", {}).get("conditions", [])
        
        prompt = f"""
        User Profile:
        Age: {age}
        Gender: {gender}
        Conditions: {', '.join(conditions) if conditions else 'None'}
        
        User Message: {message}
        
        Generate realistic vitals data for this user.
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
                return response_text

            if parsed_response.get("action") == "generate_vitals":
                data_points = parsed_response.get("data", [])
                user_id = context.get("user_id")
                
                if not user_id:
                    return "I can't generate data because I don't know who you are."

                # Insert into Supabase
                records = []
                for point in data_points:
                    records.append({
                        "user_id": user_id,
                        "type": point["type"],
                        "value": point["value"],
                        "unit": point["unit"],
                        "source": "simulation",
                        "recorded_at": datetime.now().isoformat()
                    })
                
                if records:
                    res = supabase.table("vitals").insert(records).execute()
                    
                    if res.data:
                        return parsed_response.get("response", "Data generated successfully.")
                    else:
                        return "I generated the data but couldn't save it to the database."
                else:
                    return "I couldn't generate any valid data points."
            
            else:
                return parsed_response.get("response", response_text)

        except Exception as e:
            print(f"Simulation Error: {e}")
            return "I ran into a glitch while generating your data."

simulation_agent = SimulationAgent()
