from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from auth_utils import verify_token
from database import get_db
from datetime import datetime

router = APIRouter()

class KBEntry(BaseModel):
    keywords: List[str]
    answer: str

class KBUpdate(BaseModel):
    keywords: Optional[List[str]] = None
    answer: Optional[str] = None

@router.get("/")
def list_entries(username: str = Depends(verify_token)):
    conn = get_db()
    rows = conn.execute("SELECT * FROM kb_entries ORDER BY created_at DESC").fetchall()
    conn.close()
    return [{"id": r["id"], "keywords": r["keywords"].split(","), "answer": r["answer"],
             "source": r["source"], "created_at": r["created_at"]} for r in rows]

@router.post("/")
def create_entry(entry: KBEntry, username: str = Depends(verify_token)):
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO kb_entries (keywords, answer, source) VALUES (?, ?, 'manual')",
        (",".join(k.strip().lower() for k in entry.keywords), entry.answer)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, "message": "Entry created"}

@router.put("/{entry_id}")
def update_entry(entry_id: int, update: KBUpdate, username: str = Depends(verify_token)):
    conn = get_db()
    row = conn.execute("SELECT * FROM kb_entries WHERE id = ?", (entry_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Entry not found")
    kw = ",".join(k.strip().lower() for k in update.keywords) if update.keywords else row["keywords"]
    ans = update.answer if update.answer else row["answer"]
    conn.execute(
        "UPDATE kb_entries SET keywords = ?, answer = ?, updated_at = ? WHERE id = ?",
        (kw, ans, datetime.utcnow().isoformat(), entry_id)
    )
    conn.commit()
    conn.close()
    return {"message": "Entry updated"}

@router.delete("/{entry_id}")
def delete_entry(entry_id: int, username: str = Depends(verify_token)):
    conn = get_db()
    conn.execute("DELETE FROM kb_entries WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    return {"message": "Entry deleted"}

@router.post("/promote/{log_id}")
def promote_log_to_kb(log_id: int, entry: KBEntry, username: str = Depends(verify_token)):
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO kb_entries (keywords, answer, source) VALUES (?, ?, 'promoted')",
        (",".join(k.strip().lower() for k in entry.keywords), entry.answer)
    )
    conn.execute("UPDATE chat_logs SET promoted = 1 WHERE id = ?", (log_id,))
    conn.commit()
    conn.close()
    return {"id": cur.lastrowid, "message": "Promoted to knowledge base"}
