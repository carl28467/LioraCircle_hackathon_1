import os
from supabase import create_client, Client
from typing import List, Dict, Any

class MemoryManager:
    def __init__(self):
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        if not url or not key:
            print("Warning: SUPABASE_URL or SUPABASE_KEY not found")
            self.supabase: Client = None
        else:
            self.supabase: Client = create_client(url, key)

    async def add_memory(self, user_id: str, content: str, metadata: Dict[str, Any] = {}):
        if not self.supabase:
            return
        
        # TODO: Generate embedding for content
        # embedding = generate_embedding(content)
        
        data = {
            "user_id": user_id,
            "content": content,
            "metadata": metadata,
            # "embedding": embedding
        }
        
        try:
            self.supabase.table("memories").insert(data).execute()
        except Exception as e:
            print(f"Error adding memory: {str(e)}")

    async def query_memory(self, user_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        if not self.supabase:
            return []
            
        # TODO: Generate embedding for query
        # query_embedding = generate_embedding(query)
        
        # Placeholder for vector search
        # response = self.supabase.rpc("match_memories", {
        #     "query_embedding": query_embedding,
        #     "match_threshold": 0.7,
        #     "match_count": limit,
        #     "p_user_id": user_id
        # }).execute()
        
        # For now, just return recent memories
        try:
            response = self.supabase.table("memories").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            return response.data
        except Exception as e:
            print(f"Error querying memory: {str(e)}")
            return []

memory_manager = MemoryManager()
