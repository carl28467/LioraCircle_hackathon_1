from typing import Dict, Any, Tuple, List, Optional
from ..core.llm import llm_client

class AgentOrchestrator:
    def __init__(self):
        self.personas = {
            "concierge": "You are The Concierge. Your goal is to build rapport and gather missing data. Be warm, inquisitive, and casual.",
            "auditor": "You are The Auditor. Your goal is to analyze data for anomalies. Be analytical, precise, and objective.",
            "strategist": "You are The Strategist. Your goal is to optimize logistics and resolve conflicts. Be helpful and suggestive.",
            "guardian": "You are The Guardian. Your goal is safety and immediate action. Be authoritative, loud, and direct.",
            "companion": "You are The Companion. Your goal is emotional support. Be empathetic and a good listener."
        }

    async def determine_persona(self, message: str, context: Dict[str, Any]) -> str:
        # Simple keyword-based logic for now, can be upgraded to LLM-based classification
        message_lower = message.lower()
        
        if "emergency" in message_lower or "hurt" in message_lower or "pain" in message_lower:
            return "guardian"
        elif "plan" in message_lower or "schedule" in message_lower:
            return "strategist"
        elif "sad" in message_lower or "lonely" in message_lower:
            return "companion"
        elif "analyze" in message_lower or "report" in message_lower:
            return "auditor"
        elif "simulate" in message_lower or "mock" in message_lower or "generate data" in message_lower:
            return "simulator"
        else:
            return "concierge"

    async def process_message(self, message: str, user_id: str, context: Dict[str, Any], attachments: Optional[List[Dict[str, str]]] = None, token: Optional[str] = None) -> Tuple[str, Dict[str, Any]]:
        # Check if user is in onboarding mode
        is_onboarding = not context.get("profile", {}).get("onboarding_completed", False)
        
        if is_onboarding:
            from .onboarding import onboarding_agent
            return await onboarding_agent.process_message(message, context, attachments)

        persona_key = await self.determine_persona(message, context)
        
        if persona_key == "strategist":
            from .strategist import strategist_agent
            response = await strategist_agent.process_message(message, context, attachments)
            return response, {}
            
        if persona_key == "simulator":
            from .simulation import simulation_agent
            # Ensure user_id is in context for the simulation agent
            context["user_id"] = user_id
            response = await simulation_agent.process_message(message, context, attachments)
            return response, {}

        system_instruction = self.personas.get(persona_key, self.personas["concierge"])
        
        response = await llm_client.generate_response(message, system_instruction=system_instruction, attachments=attachments)
        return response, {}

orchestrator = AgentOrchestrator()
