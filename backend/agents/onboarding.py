import json
from typing import Dict, Any, List, Optional, Tuple
from backend.core.llm import llm_client

class OnboardingAgent:
    def __init__(self):
        import os
        from supabase import create_client, Client
        
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        if url and key:
            self.supabase: Client = create_client(url, key)
        else:
            self.supabase = None
            print("Warning: SUPABASE_URL or SUPABASE_KEY not found in OnboardingAgent")

        self.system_instruction = """

You are Liora, an intelligent and empathetic Agentic Health OS. 
You are currently in the "Onboarding Phase" with a new user.
Your goal is to build a structured health profile (JSON) through a natural, low-friction conversation.

### CURRENT CONTEXT
Existing Profile Data: {profile_context}

### STATE
{state_context}

### CORE BEHAVIORS
1. **The "Pivot" Rule:** Do not blindly follow a checklist. If the user mentions a significant health factor (e.g., "I'm pregnant" or "I have diabetes"), IMMEDIATELY pivot to ask relevant follow-up questions (e.g., "Which trimester?" or "Do you use a CGM?") before returning to standard biometrics.
2. **One Question at a Time:** Never overwhelm the user. Ask max 1-2 questions per turn.
3. **Implicit Extraction:** Look for clues. "I chase my toddlers around" implies `parent_status: true`. "I walk to work" implies `activity_level: moderate`.

### INSTRUCTIONS

1. **ANALYZE THE INPUT:**
   - Detect **Multiple Entities**: Handle "I'm Mike, 34, 180lbs" in a single turn.
   - Detect **Sentiment**: If user seems anxious/hesitant, validate them ("It's okay not to know exact numbers, estimates are fine.").
   - Detect **Completion Intent**: 
     - If the user says "That's all", "Looks good", "Yes" *after* you have provided a summary, set `onboarding_completed: true`.
     - **CRITICAL:** If the user explicitly says "finish", "stop", "skip", "done", "that's it", "no more", or confirms with "Yes, everything is correct", you MUST IMMEDIATELY stop asking questions.
     - If "Yes, everything is correct" or similar confirmation is received AND `suggest_completion` is true, set `onboarding_completed: true`.

2. **EXTRACT & UPDATE (JSON)**
   - Extract fields into `profile_data`. Use null if unknown.
   - **Normalization Rules:**
     - Height: Convert to cm or ft/in string.
     - Weight: Convert to kg or lbs string.
     - Sex: 'Male', 'Female', or 'Intersex/Other'.
   - **Target Fields:**
     - `name`, `age`, `height`, `weight`, `sex`.
     - `conditions` (Array), `medications` (Array), `allergies` (Array).
     - `wearables` (Array - e.g., 'Apple Watch', 'Oura', 'CGM').
     - `role` (Derived - e.g., 'Mom', 'Dad', 'Pioneer').
     - `relationship` (If role is 'joiner', extract relationship to pioneer e.g., 'Spouse', 'Child').

3. **DETERMINE NEXT STEP:**
   - **CRITICAL OVERRIDE:** IF `suggest_completion` is true AND the user says "Yes", "Correct", "Yes, everything is correct", or "Finish" -> Set `onboarding_completed: true` immediately. Do NOT ask for confirmation again.
   
   - **JOINER FLOW (If role is 'joiner'):**
     - **IF** `family_id` is MISSING:
       - Ask for the Family Invite Code (e.g., "Do you have the 6-character code from the Pioneer?").
       - Ask for the Family Invite Code (e.g., "Do you have the 6-character code from the Pioneer?").
       - **IF** user provides a code (looks like "LIORA-XXXXXX" or similar) -> Output `check_family_code: "CODE"`. 
       - **IF** user provides a code (looks like "LIORA-XXXXXX" or similar) -> Output `check_family_code: "CODE"`. 
       - **CRITICAL:** DO NOT output `check_family_code` if the user has NOT provided a specific code. Do NOT guess.
       - **CRITICAL:** If `role` is 'pioneer', NEVER output `check_family_code`. Pioneers CREATE families, they do not join them.
     - **IF** `family_id` is PRESENT (Join Successful):
       - **IF** `relationship` is MISSING -> Ask: "How are you related to the family pioneer?"
       - **IF** `relationship` is PRESENT -> Continue to standard health questions (Name, Age, etc.).

   - **STANDARD FLOW:**
     - **Check Requirements:** Are [Name, Age, Sex, Medical Conditions] known?
     - **Logic Branch:**
       - **IF** User requested to FINISH/STOP -> Set `suggest_completion: true`. Response: "Understood. Here is what I have so far: [Summary]. Is this correct?"
       - **IF** vital info is missing -> Ask the next most relevant question.
       - **IF** vital info is collected BUT `suggest_completion` was False -> Set `suggest_completion: true`. Your `response` must now be a SUMMARY: "Thanks [Name]. Here is what I have: [Summary]. Is this correct?"
       - **IF** `suggest_completion` was ALREADY True AND User corrects data -> Update data, keep `suggest_completion: true`, and ask for confirmation again.

4. **FORMULATE RESPONSE:**
   - **Acknowledge & Thread:** "Got it, Type 2 Diabetes. Do you take metformin or insulin for that?" (Threading).
   - **Tone:** Warm, professional. Use emojis sparingly if the user uses them.

### OUTPUT FORMAT (STRICT JSON)
Return ONLY a JSON object. Do NOT include comments (//) in the JSON.

{{
    "response": "The text string Liora speaks to the user.",
    "updates": {{
        "suggest_completion": boolean, 
        "onboarding_completed": boolean, 
        "check_family_code": "CODE", 
        "profile_data": {{
            "conditions": ["Type 2 Diabetes"], 
            "has_cgm": true,
            "relationship": "Spouse"
        }}
    }}
}}
        """

    async def process_message(self, message: str, context: Dict[str, Any], attachments: Optional[List[Dict[str, str]]] = None) -> Tuple[str, Dict[str, Any]]:
        # Prepare context string
        profile_obj = context.get("profile", {})
        current_data = profile_obj.get("profile_data", {})
        suggest_completion_state = profile_obj.get("suggest_completion", False)
        
        # Add role and family_id to context for LLM awareness
        role = profile_obj.get("role")
        family_id = profile_obj.get("family_id")
        
        # Merge top-level fields into context for the LLM to see
        context_summary = {
            **current_data,
            "role": role,
            "family_id": family_id
        }
        
        profile_context = json.dumps(context_summary, indent=2)
        state_context = f"suggest_completion: {str(suggest_completion_state).lower()}"
        
        instruction = self.system_instruction.format(
            profile_context=profile_context,
            state_context=state_context
        )
        
        # Call LLM
        prompt = f"User Message: {message}\n\nRemember to return ONLY valid JSON."
        
        print(f"[Onboarding] Processing message: '{message}' with state: {state_context}")

        raw_response = await llm_client.generate_response(prompt, system_instruction=instruction, attachments=attachments)
        
        # Parse JSON response
        try:
            # Robust JSON extraction using brace counting
            start_idx = raw_response.find('{')
            if start_idx != -1:
                brace_count = 0
                end_idx = -1
                for i, char in enumerate(raw_response[start_idx:], start=start_idx):
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_idx = i + 1
                            break
                if end_idx != -1:
                    clean_response = raw_response[start_idx:end_idx]
                else:
                     clean_response = raw_response.strip() # Fallback
            else:
                clean_response = raw_response.strip()

            # Remove any potential JS-style comments if they still appear
            import re
            clean_response = re.sub(r'//.*', '', clean_response)
            
            parsed = json.loads(clean_response)
            
            response_text = parsed.get("response", "I'm having trouble understanding. Could you repeat that?")
            updates = parsed.get("updates", {})
            
            print(f"[Onboarding] LLM Updates: {updates}")

            # --- HANDLE FAMILY CODE CHECK ---
            if "check_family_code" in updates and self.supabase:
                # STRICT GUARD: Pioneers never check codes
                if context.get("profile", {}).get("role") == "pioneer":
                    print("[Onboarding] Blocked code check for Pioneer role.")
                    del updates["check_family_code"]
                else:
                    code = updates["check_family_code"]
                    
                    # Validate code before checking
                    if not code or str(code).lower() == "none" or str(code).lower() == "null" or len(str(code)) < 3:
                         print(f"[Onboarding] Invalid family code detected: {code}. Skipping check.")
                         del updates["check_family_code"]
                    else:
                        print(f"[Onboarding] Validating family code: {code}")
                        try:
                            # Query Supabase using the secure RPC function
                            res = self.supabase.rpc("check_family_code", {"code": code}).execute()
                            
                            if res.data and len(res.data) > 0:
                                family = res.data[0]
                                updates["join_family_id"] = family["id"]
                                updates["family_name"] = family["name"]
                                
                                # Override response to confirm success
                                response_text = f"Great! I found **{family['name']}**. I've connected you to the circle. Now, to help me understand the family structure, how are you related to the Pioneer?"
                            else:
                                # Override response to report failure
                                response_text = f"I couldn't find a Family Circle with the code `{code}`. Please double-check it and try again."
                                # Remove the invalid code check so it doesn't persist or confuse
                                del updates["check_family_code"]
                        except Exception as e:
                            print(f"[Onboarding] Error checking family code: {e}")
                            response_text = "I'm having trouble connecting to the family database right now. Please try again later."

            # Check for completion and Pioneer role
            # We need to check if the AI *just* marked it as complete
            if updates.get("onboarding_completed"):
                role = context.get("profile", {}).get("role")
                if role == "pioneer":
                    import random
                    import string
                    # Generate a simple 6-char code
                    chars = string.ascii_uppercase + string.digits
                    code = "LIORA-" + "".join(random.choices(chars, k=6))
                    updates["family_code"] = code
            
            return response_text, updates
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from LLM: {raw_response}")
            return raw_response, {}

onboarding_agent = OnboardingAgent()
