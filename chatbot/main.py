import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, validator
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai
from openai import OpenAI
import asyncio
import time
from collections import defaultdict
import jwt

# Load environment variables
load_dotenv()

app = FastAPI(title="PixelPerfect AI Concierge API")

# Security scheme
security = HTTPBearer()

# Rate limiting storage (in-memory - use Redis in production)
rate_limit_storage = defaultdict(list)
RATE_LIMIT_REQUESTS = 50  # requests per window
RATE_LIMIT_WINDOW = 3600  # 1 hour in seconds

# Configure CORS - restrict to specific origins in production
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["authorization", "content-type", "x-client-info", "apikey"],
)

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "")
supabase: Client = create_client(supabase_url, supabase_key)

# API Keys
keys = {
    "gemini": os.getenv("GEMINI_API_KEY"),
    "openai": os.getenv("OPENAI_API_KEY"),
    "grok": os.getenv("GROK_API_KEY"),
    "openrouter": os.getenv("OPENROUTER_API_KEY"),
}

# Models with input validation
class Message(BaseModel):
    role: str
    content: str
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ['user', 'assistant', 'system']:
            raise ValueError('Role must be user, assistant, or system')
        return v
    
    @validator('content')
    def validate_content(cls, v):
        if len(v) > 10000:  # Max 10k characters per message
            raise ValueError('Message content too long (max 10000 characters)')
        return v

class ChatRequest(BaseModel):
    messages: List[Message]
    provider: Optional[str] = "gemini"
    use_rag: Optional[bool] = True
    
    @validator('messages')
    def validate_messages(cls, v):
        if len(v) > 50:  # Max 50 messages in conversation
            raise ValueError('Too many messages (max 50)')
        if len(v) == 0:
            raise ValueError('At least one message required')
        return v
    
    @validator('provider')
    def validate_provider(cls, v):
        valid_providers = ['gemini', 'openai', 'grok', 'openrouter']
        if v not in valid_providers:
            raise ValueError(f'Invalid provider. Must be one of: {valid_providers}')
        return v


def verify_supabase_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify Supabase JWT token and extract user info."""
    token = credentials.credentials
    
    try:
        # Decode without verification first to get the payload structure
        # In production, verify with the actual JWT secret
        if supabase_jwt_secret:
            decoded = jwt.decode(
                token,
                supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated"
            )
        else:
            # If no secret configured, decode without verification (development only)
            decoded = jwt.decode(token, options={"verify_signature": False})
        
        user_id = decoded.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
        
        return {"user_id": user_id, "email": decoded.get("email")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def check_rate_limit(user_id: str):
    """Check if user has exceeded rate limit."""
    current_time = time.time()
    user_requests = rate_limit_storage[user_id]
    
    # Remove old requests outside the window
    rate_limit_storage[user_id] = [
        req_time for req_time in user_requests 
        if current_time - req_time < RATE_LIMIT_WINDOW
    ]
    
    if len(rate_limit_storage[user_id]) >= RATE_LIMIT_REQUESTS:
        raise HTTPException(
            status_code=429, 
            detail=f"Rate limit exceeded. Max {RATE_LIMIT_REQUESTS} requests per hour."
        )
    
    # Add current request
    rate_limit_storage[user_id].append(current_time)


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
            messages=messages,
            max_tokens=1000  # Cost control
        )
        return response.choices[0].message.content

    @staticmethod
    async def call_grok(messages: List[dict]) -> str:
        if not keys["grok"]: raise ValueError("Missing Grok Key")
        client = OpenAI(api_key=keys["grok"], base_url="https://api.x.ai/v1")
        response = client.chat.completions.create(
            model="grok-beta",
            messages=messages,
            max_tokens=1000  # Cost control
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
            messages=messages,
            max_tokens=1000  # Cost control
        )
        return response.choices[0].message.content


@app.post("/chat")
async def chat(request: ChatRequest, user: dict = Depends(verify_supabase_token)):
    """Protected chat endpoint requiring Supabase authentication."""
    
    # Check rate limit for this user
    check_rate_limit(user["user_id"])
    
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
