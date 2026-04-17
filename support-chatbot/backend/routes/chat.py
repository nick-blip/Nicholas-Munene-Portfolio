from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import re
import httpx
from database import get_db

router = APIRouter()

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

UNIVERSAL_PATTERNS = [
    (r"\b(time|current time|what time)\b", "time"),
    (r"\b(date|today|what day|what's today)\b", "date"),
    (r"\b(hello|hi|hey|good morning|good afternoon|good evening|howdy)\b", "greeting"),
    (r"\b(bye|goodbye|see you|take care|cya)\b", "farewell"),
    (r"\b(thank you|thanks|cheers|appreciate)\b", "thanks"),
    (r"\b(help|what can you do|capabilities|features)\b", "help"),
    (r"\b(who are you|what are you|your name)\b", "identity"),
]

UNIVERSAL_RESPONSES = {
    "greeting": "Hello! Welcome to our support. How can I help you today?",
    "farewell": "Goodbye! Feel free to reach out anytime. Have a great day!",
    "thanks": "You're very welcome! Is there anything else I can help you with?",
    "help": "I can help you with refunds, shipping, account access, payments, cancellations, warranties, and general support queries. What do you need help with?",
    "identity": "I'm your automated support assistant. I'm here to help you with any questions about our products and services.",
}

def match_universal(question: str, timezone: str):
    lower = question.lower()
    for pattern, intent in UNIVERSAL_PATTERNS:
        if re.search(pattern, lower):
            if intent == "time":
                return f"__TIME__{timezone}", "universal"
            if intent == "date":
                return f"__DATE__{timezone}", "universal"
            if intent in UNIVERSAL_RESPONSES:
                return UNIVERSAL_RESPONSES[intent], "universal"
    return None, None

def match_kb(question: str):
    conn = get_db()
    entries = conn.execute("SELECT * FROM kb_entries").fetchall()
    conn.close()
    lower = question.lower()
    best, best_score = None, 0
    for entry in entries:
        keywords = [k.strip() for k in entry["keywords"].split(",") if k.strip()]
        score = sum(1 for kw in keywords if kw in lower)
        if score > best_score:
            best_score = score
            best = entry
    if best_score > 0:
        return best["answer"], "kb"
    return None, None

async def ask_claude(question: str):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="NLP service not configured. Set ANTHROPIC_API_KEY.")
    conn = get_db()
    entries = conn.execute("SELECT keywords, answer FROM kb_entries").fetchall()
    conn.close()
    kb_context = "\n".join(
        f"Keywords: {e['keywords']}\nAnswer: {e['answer']}" for e in entries
    )
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 500,
                "system": (
                    "You are a friendly customer support assistant. "
                    "Use the knowledge base below as your primary source. "
                    "If the question is not covered, answer helpfully and concisely using general knowledge. "
                    "Never make up specific company policies not in the knowledge base. "
                    "Keep answers under 3 sentences.\n\n"
                    f"Knowledge Base:\n{kb_context}"
                ),
                "messages": [{"role": "user", "content": question}],
            },
        )
    data = response.json()
    if "content" in data:
        return "".join(b.get("text", "") for b in data["content"]), "nlp"
    raise HTTPException(status_code=502, detail="NLP service error")

class ChatRequest(BaseModel):
    question: str
    timezone: Optional[str] = "UTC"

class RatingRequest(BaseModel):
    rating: int

@router.post("/message")
async def chat_message(req: ChatRequest):
    q = req.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Empty question")

    answer, response_type = match_universal(q, req.timezone or "UTC")

    if not answer:
        answer, response_type = match_kb(q)

    if not answer:
        answer, response_type = await ask_claude(q)

    conn = get_db()
    cur = conn.execute(
        "INSERT INTO chat_logs (question, answer, response_type, timezone) VALUES (?, ?, ?, ?)",
        (q, answer, response_type, req.timezone)
    )
    log_id = cur.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": log_id,
        "answer": answer,
        "type": response_type,
    }

@router.post("/rate/{log_id}")
def rate_response(log_id: int, req: RatingRequest):
    if req.rating < 1 or req.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1–5")
    flag = 1 if req.rating <= 2 else 0
    conn = get_db()
    conn.execute(
        "UPDATE chat_logs SET rating = ?, flagged_for_review = ? WHERE id = ?",
        (req.rating, flag, log_id)
    )
    conn.commit()
    conn.close()
    return {"message": "Rating saved", "flagged": bool(flag)}

@router.get("/logs")
def get_logs(username: str = None):
    from auth_utils import verify_token
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM chat_logs ORDER BY created_at DESC LIMIT 200"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
