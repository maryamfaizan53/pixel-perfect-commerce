import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai
from openai import OpenAI
import asyncio

# Load environment variables
load_dotenv()

app = FastAPI(title="PixelPerfect AI Concierge API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# API Keys
keys = {
    "gemini": os.getenv("GEMINI_API_KEY"),
    "openai": os.getenv("OPENAI_API_KEY"),
    "grok": os.getenv("GROK_API_KEY"),
    "openrouter": os.getenv("OPENROUTER_API_KEY"),
}

# Models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    provider: Optional[str] = "gemini"
    use_rag: Optional[bool] = True

# AI Service Implementation
class AIService:
    @staticmethod
    async def get_embedding(text: str) -> List[float]:
        if not keys["gemini"]:
            raise ValueError("Gemini key required for embeddings")
        genai.configure(api_key=keys["gemini"])
        model = "models/embedding-001"
        embedding = genai.embed_content(model=model, content=text, task_type="retrieval_query")
        return embedding['embedding']

    @staticmethod
    async def retrieve_context(query: str) -> str:
        try:
            embedding = await AIService.get_embedding(query)
            # RPC call to Supabase match_documents
            result = supabase.rpc('match_documents', {
                'query_embedding': embedding,
                'match_threshold': 0.5,
                'match_count': 3
            }).execute()
            
            if not result.data:
                return "No specific context available."
            
            return "\n---\n".join([doc['content'] for doc in result.data])
        except Exception as e:
            print(f"RAG Error: {e}")
            return "Context retrieval failed."

    @staticmethod
    async def call_gemini(prompt: str) -> str:
        if not keys["gemini"]: raise ValueError("Missing Gemini Key")
        genai.configure(api_key=keys["gemini"])
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text

    @staticmethod
    async def call_openai(messages: List[dict]) -> str:
        if not keys["openai"]: raise ValueError("Missing OpenAI Key")
        client = OpenAI(api_key=keys["openai"])
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        return response.choices[0].message.content

    @staticmethod
    async def call_grok(messages: List[dict]) -> str:
        if not keys["grok"]: raise ValueError("Missing Grok Key")
        client = OpenAI(api_key=keys["grok"], base_url="https://api.x.ai/v1")
        response = client.chat.completions.create(
            model="grok-beta",
            messages=messages
        )
        return response.choices[0].message.content

    @staticmethod
    async def call_openrouter(messages: List[dict]) -> str:
        if not keys["openrouter"]: raise ValueError("Missing OpenRouter Key")
        client = OpenAI(
            api_key=keys["openrouter"],
            base_url="https://openrouter.ai/api/v1"
        )
        response = client.chat.completions.create(
            model="meta-llama/llama-3.1-405b",
            messages=messages
        )
        return response.choices[0].message.content

@app.post("/chat")
async def chat(request: ChatRequest):
    context = ""
    if request.use_rag:
        last_msg = request.messages[-1].content
        context = await AIService.retrieve_context(last_msg)

    system_prompt = f"""You are the PixelPerfect AI Concierge, a luxury boutique assistant.
Use the context below to assist the client. Maintain a sophisticated, helpful tone.

CONTEXT:
{context}
"""
    
    # Prepare standard message format
    full_messages = [{"role": "system", "content": system_prompt}]
    for msg in request.messages:
        full_messages.append({"role": msg.role, "content": msg.content})

    # Provider list with fallback order
    providers = ["gemini", "openai", "grok", "openrouter"]
    # Re-order based on requested provider
    if request.provider in providers:
        providers.remove(request.provider)
        providers.insert(0, request.provider)

    errors = []
    for provider in providers:
        try:
            if provider == "gemini":
                # Gemini often prefers simple text or specific format
                prompt = "\n".join([f"{m['role']}: {m['content']}" for m in full_messages])
                return {"response": await AIService.call_gemini(prompt), "provider": "gemini"}
            elif provider == "openai":
                return {"response": await AIService.call_openai(full_messages), "provider": "openai"}
            elif provider == "grok":
                return {"response": await AIService.call_grok(full_messages), "provider": "grok"}
            elif provider == "openrouter":
                return {"response": await AIService.call_openrouter(full_messages), "provider": "openrouter"}
        except Exception as e:
            error_msg = f"{provider} failed: {str(e)}"
            print(error_msg)
            errors.append(error_msg)
            continue

    raise HTTPException(status_code=503, detail={"message": "All AI providers failed.", "errors": errors})

@app.get("/health")
async def health():
    return {"status": "luxury-ready"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=os.getenv("HOST", "0.0.0.0"), port=int(os.getenv("PORT", 8000)))
