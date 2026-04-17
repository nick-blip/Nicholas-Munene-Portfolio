from fastapi import APIRouter, Depends
from auth_utils import verify_token
from database import get_db

router = APIRouter()

@router.get("/summary")
def get_summary(username: str = Depends(verify_token)):
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) as c FROM chat_logs").fetchone()["c"]
    rated = conn.execute("SELECT COUNT(*) as c FROM chat_logs WHERE rating IS NOT NULL").fetchone()["c"]
    avg_rating = conn.execute("SELECT AVG(rating) as a FROM chat_logs WHERE rating IS NOT NULL").fetchone()["a"]
    kb_count = conn.execute("SELECT COUNT(*) as c FROM chat_logs WHERE response_type = 'kb'").fetchone()["c"]
    nlp_count = conn.execute("SELECT COUNT(*) as c FROM chat_logs WHERE response_type = 'nlp'").fetchone()["c"]
    universal_count = conn.execute("SELECT COUNT(*) as c FROM chat_logs WHERE response_type = 'universal'").fetchone()["c"]
    flagged = conn.execute("SELECT COUNT(*) as c FROM chat_logs WHERE flagged_for_review = 1 AND promoted = 0").fetchone()["c"]
    satisfied = conn.execute("SELECT COUNT(*) as c FROM chat_logs WHERE rating >= 4").fetchone()["c"]

    dist = {}
    for s in range(1, 6):
        dist[str(s)] = conn.execute(
            "SELECT COUNT(*) as c FROM chat_logs WHERE rating = ?", (s,)
        ).fetchone()["c"]

    daily = conn.execute("""
        SELECT DATE(created_at) as day, COUNT(*) as count
        FROM chat_logs
        GROUP BY DATE(created_at)
        ORDER BY day DESC
        LIMIT 14
    """).fetchall()

    nlp_flagged = conn.execute("""
        SELECT * FROM chat_logs
        WHERE response_type = 'nlp' AND promoted = 0
        ORDER BY created_at DESC
        LIMIT 50
    """).fetchall()

    conn.close()

    sat_pct = round(satisfied / rated * 100) if rated > 0 else 0
    kb_pct = round(kb_count / total * 100) if total > 0 else 0

    return {
        "total": total,
        "rated": rated,
        "avg_rating": round(avg_rating, 1) if avg_rating else None,
        "kb_count": kb_count,
        "nlp_count": nlp_count,
        "universal_count": universal_count,
        "flagged_count": flagged,
        "satisfaction_pct": sat_pct,
        "kb_match_pct": kb_pct,
        "rating_distribution": dist,
        "daily_volume": [{"day": r["day"], "count": r["count"]} for r in daily],
        "nlp_flagged": [dict(r) for r in nlp_flagged],
    }
