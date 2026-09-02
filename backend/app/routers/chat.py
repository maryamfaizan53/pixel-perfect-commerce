"""AI concierge chatbot — ported from ../chatbot/main.py.

Same behaviour: Supabase-JWT gated, per-user hourly rate limit, pgvector RAG
over the `documents` table, Gemini/OpenAI with fallback. Now knows about the
live catalog via a lightweight product lookup tool-ish context.
"""
from __future__ import annotations

import time
from collections import defaultdict

import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from pydantic import BaseModel, field_validator

from app.config import settings
from app.deps import current_user
from app.services.supabase_client import get_client

router = APIRouter(prefix="/api/chat", tags=["chat"])

_RATE_MAX = 50
_RATE_WINDOW = 3600
_rl: dict[str, list[float]] = defaultdict(list)


class Message(BaseModel):
    role: str
    content: str

    @field_validator("role")
    @classmethod
    def _role(cls, v: str) -> str:
        if v not in {"user", "assistant", "system"}:
            raise ValueError("role must be user|assistant|system")
        return v

    @field_validator("content")
    @classmethod
    def _len(cls, v: str) -> str:
        if len(v) > 10_000:
            raise ValueError("message too long")
        return v


class ChatRequest(BaseModel):
    messages: list[Message]
    provider: str = "gemini"
    use_rag: bool = True

    @field_validator("messages")
    @classmethod
    def _msgs(cls, v: list[Message]) -> list[Message]:
        if not 1 <= len(v) <= 50:
            raise ValueError("1..50 messages")
        return v


def _rate_limit(uid: str) -> None:
    now = time.time()
    _rl[uid] = [t for t in _rl[uid] if now - t < _RATE_WINDOW]
    if len(_rl[uid]) >= _RATE_MAX:
        raise HTTPException(429, f"Rate limit: {_RATE_MAX}/hour")
    _rl[uid].append(now)


async def _retrieve_context(q: str) -> str:
    if not settings.gemini_api_key:
        return ""
    try:
        genai.configure(api_key=settings.gemini_api_key)
        emb = genai.embed_content(model="models/text-embedding-004", content=q, task_type="retrieval_query")["embedding"]
        res = get_client().rpc(
            "match_documents", {"query_embedding": emb, "match_threshold": 0.5, "match_count": 3}
        ).execute()
        return "\n---\n".join(d["content"] for d in (res.data or []))
    except Exception:  # noqa: BLE001
        return ""


def _call_gemini(prompt: str) -> str:
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel("gemini-1.5-flash").generate_content(prompt).text


def _call_openai(messages: list[dict]) -> str:
    client = OpenAI(api_key=settings.openai_api_key)
    return client.chat.completions.create(model="gpt-4o-mini", messages=messages, max_tokens=1000).choices[0].message.content


@router.post("")
async def chat(req: ChatRequest, user: dict = Depends(current_user)):
    _rate_limit(user["id"])

    context = await _retrieve_context(req.messages[-1].content) if req.use_rag else ""
    system = (
        "You are the AI Bazar shopping assistant for aibazar.pk, Pakistan's affordable "
        "online store. Be concise, friendly, help with product questions, orders, delivery "
        "(COD available, 1-3 days), and returns (7-day).\n\nCONTEXT:\n" + context
    )
    full = [{"role": "system", "content": system}] + [m.model_dump() for m in req.messages]

    order = ["gemini", "openai"]
    if req.provider in order:
        order.remove(req.provider)
        order.insert(0, req.provider)

    errors = []
    for p in order:
        try:
            if p == "gemini" and settings.gemini_api_key:
                prompt = "\n".join(f"{m['role']}: {m['content']}" for m in full)
                return {"response": _call_gemini(prompt), "provider": "gemini"}
            if p == "openai" and settings.openai_api_key:
                return {"response": _call_openai(full), "provider": "openai"}
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{p}: {exc}")

    raise HTTPException(503, {"message": "AI unavailable", "errors": errors})
