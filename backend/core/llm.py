import os
import google.generativeai as genai
from openai import OpenAI
from typing import List, Dict, Any, Optional

class LLMClient:
    def __init__(self, provider: str = "gemini"):
        self.provider = provider
        self.api_key = os.getenv("GEMINI_API_KEY") if provider == "gemini" else os.getenv("OPENAI_API_KEY")
        
        if self.provider == "gemini":
            if not self.api_key:
                print("Warning: GEMINI_API_KEY not found")
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash') # Updated to 1.5 Flash for better multimodal
        elif self.provider == "openai":
            if not self.api_key:
                print("Warning: OPENAI_API_KEY not found")
            self.client = OpenAI(api_key=self.api_key)
        elif self.provider == "pipeshift":
            self.api_key = os.getenv("PIPESHIFT_API_KEY")
            base_url = os.getenv("PIPESHIFT_BASE_URL", "https://api.pipeshift.com/api/v0/")
            if not self.api_key:
                print("Warning: PIPESHIFT_API_KEY not found")
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=base_url
            )
        
    async def generate_response(self, prompt: str, system_instruction: Optional[str] = None, attachments: Optional[List[Dict[str, str]]] = None) -> str:
        if self.provider == "gemini":
            # Prepare content parts
            parts = []
            
            # Add system instruction as text first (if needed, though system_instruction param is better in newer API, we stick to prompt for now)
            if system_instruction:
                parts.append(f"System Instruction: {system_instruction}")
            
            parts.append(prompt)
            
            # Handle attachments
            if attachments:
                for att in attachments:
                    # att = {"type": "image/png", "data": "base64..."}
                    if "data" in att:
                        parts.append({
                            "mime_type": att.get("type", "image/jpeg"),
                            "data": att["data"]
                        })
            
            try:
                response = self.model.generate_content(parts)
                return response.text
            except Exception as e:
                return f"Error generating response from Gemini: {str(e)}"
                
        elif self.provider == "openai" or self.provider == "pipeshift":
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            
            user_content = [{"type": "text", "text": prompt}]
            
            if attachments:
                for att in attachments:
                    # OpenAI/PipeShift expects data URI for images
                    if "data" in att:
                        mime = att.get("type", "application/octet-stream")
                        
                        if mime.startswith("image/"):
                            data_uri = f"data:{mime};base64,{att['data']}"
                            user_content.append({
                                "type": "image_url",
                                "image_url": {
                                    "url": data_uri
                                }
                            })
                        elif mime.startswith("text/") or mime == "application/json":
                            try:
                                import base64
                                decoded_text = base64.b64decode(att['data']).decode('utf-8')
                                user_content[0]["text"] += f"\n\n[Attached File: {att.get('name', 'file')}]\n{decoded_text}"
                            except Exception as e:
                                print(f"Failed to decode text attachment: {e}")
                        elif mime == "application/pdf":
                            try:
                                import base64
                                import io
                                from pypdf import PdfReader
                                
                                decoded_bytes = base64.b64decode(att['data'])
                                pdf_file = io.BytesIO(decoded_bytes)
                                reader = PdfReader(pdf_file)
                                text = ""
                                for page in reader.pages:
                                    text += page.extract_text() + "\n"
                                
                                user_content[0]["text"] += f"\n\n[Attached PDF: {att.get('name', 'file')}]\n{text}"
                            except Exception as e:
                                print(f"Failed to read PDF: {e}")
                                user_content[0]["text"] += f"\n\n[Attached PDF: {att.get('name', 'file')} - Error reading content]"
                        else:
                            # For other types, we might need specific handling.
                            # For now, just note it.
                            user_content[0]["text"] += f"\n\n[Attached File: {att.get('name', 'file')} ({mime}) - Content not extracted]"

            messages.append({"role": "user", "content": user_content})
            
            model_name = "gpt-4o" if self.provider == "openai" else "neysa-qwen3-vl-30b-a3b"
            
            try:
                response = self.client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    max_tokens=5000,
                    temperature=0.6
                )
                return response.choices[0].message.content
            except Exception as e:
                return f"Error generating response from {self.provider}: {str(e)}"
        
        return "Invalid provider specified."

# Singleton instance
llm_client = LLMClient(provider=os.getenv("LLM_PROVIDER", "gemini"))
