# Support Chatbot

A customer support chatbot with keyword-based knowledge base, Claude NLP fallback, JWT-protected admin panel, and analytics dashboard.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 + FastAPI |
| Database | SQLite (file-based, zero config) |
| Auth | JWT (12-hour tokens) |
| NLP | Anthropic Claude API |
| Frontend | React 18 + Vite |
| Container | Docker + Docker Compose |

---

## How the response pipeline works

```
User question
      │
      ▼
1. Universal matcher  ─── time/date/greeting/help → instant answer (device timezone-aware)
      │ no match
      ▼
2. Keyword matcher    ─── scans KB entries → returns best keyword-score match
      │ no match
      ▼
3. Claude NLP         ─── calls Anthropic API with KB as context → AI-generated answer
      │
      ▼
User rates (1–5★)
      │
   rating ≤ 2 → flagged for admin review
      │
   admin reviews NLP log → edits keywords/answer → promotes to KB
```

---

## Quick start (local, no Docker)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY and JWT_SECRET

# Load env and start
export $(cat .env | xargs)
python main.py
# API running at http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

### 3. Open the app

- Chat: http://localhost:5173
- Admin: http://localhost:5173/#/admin
  - Default login: `admin` / `admin123`
  - **Change the password immediately after first login** via Settings

---

## Docker deployment

```bash
cp .env.example .env
# Edit .env with your real values

docker compose up --build -d

# App at http://localhost
# Admin at http://localhost/#/admin
```

To view logs:
```bash
docker compose logs -f backend
```

To stop:
```bash
docker compose down
```

Database is persisted in a Docker volume (`chatbot_data`). To back it up:
```bash
docker cp chatbot_backend:/data/chatbot.db ./backup.db
```

---

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | required |
| `JWT_SECRET` | Secret for signing JWT tokens (use 32+ random chars) | `changeme` |
| `ADMIN_USER` | Admin username | `admin` |
| `ADMIN_PASS` | Admin password | `admin123` |
| `DB_PATH` | Path to SQLite database file | `chatbot.db` |

---

## Admin panel features

### Knowledge base
- View, add, edit, delete keyword entries
- Each entry has comma-separated keywords and a full answer
- Source tag shows whether entry was added manually, promoted from NLP, or is a default

### NLP review
- Filter by: flagged (1–2★), unrated, all NLP answers
- Edit keywords and answer before promoting to KB
- Once promoted, that question type will be answered from KB going forward

### Analytics
- Total conversations, average rating, KB match rate, satisfaction rate (4–5★)
- Rating distribution bar chart
- Response source breakdown (KB / NLP / Universal)
- Daily conversation volume (14 days)

### Settings
- Change admin password

---

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Get JWT token |
| GET | `/api/auth/me` | JWT | Verify token |
| POST | `/api/chat/message` | — | Send chat message |
| POST | `/api/chat/rate/{id}` | — | Submit star rating |
| GET | `/api/chat/logs` | — | Get all chat logs |
| GET | `/api/kb/` | JWT | List KB entries |
| POST | `/api/kb/` | JWT | Create KB entry |
| PUT | `/api/kb/{id}` | JWT | Update KB entry |
| DELETE | `/api/kb/{id}` | JWT | Delete KB entry |
| POST | `/api/kb/promote/{log_id}` | JWT | Promote NLP log to KB |
| GET | `/api/analytics/summary` | JWT | Analytics data |

Interactive API docs: http://localhost:8000/docs

---

## Migrating to PostgreSQL (when ready)

1. `pip install asyncpg databases`
2. Replace `sqlite3` in `database.py` with `databases` + `sqlalchemy`
3. Update `DB_PATH` env to a Postgres connection string
4. All logic stays the same — only the DB driver changes

---

## Security checklist before production

- [ ] Set a strong `JWT_SECRET` (32+ random chars)
- [ ] Change default admin password in `.env`
- [ ] Add HTTPS (nginx reverse proxy with Let's Encrypt)
- [ ] Restrict CORS origins in `main.py` to your actual domain
- [ ] Set `reload=False` in uvicorn for production
