# Running FixMyBits

## Quick Start (both servers)

```bash
bash start-both.sh
```

---

## Manual Start

### Backend (Terminal 1)

```bash
cd backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
python manage.py runserver 0.0.0.0:8000
```

### Frontend (Terminal 2)

```bash
cd "Landing page design"
npm run dev
```

| Server   | URL                                  |
|----------|--------------------------------------|
| Backend  | http://localhost:8000/api/docs/      |
| Frontend | http://localhost:5173                |
| Health   | http://localhost:8000/healthz        |

---

## Environment Setup

**Backend** — copy and fill in `backend/.env.example` → `backend/.env`:
```
DEBUG=True
SECRET_KEY=change-me
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CELERY_TASK_ALWAYS_EAGER=True
```

**Frontend** — copy and fill in `Landing page design/.env.example` → `Landing page design/.env.local`:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Troubleshooting

### Backend won't start
```bash
cd backend
python manage.py check
python manage.py migrate
```

### Frontend won't start
```bash
cd "Landing page design"
npm install
npm run dev
```

### Port already in use

```bash
# Windows — find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### CORS errors in browser
Make sure `CORS_ALLOWED_ORIGINS` in `backend/.env` includes `http://localhost:5173`.

---

## Creating an admin account

```bash
cd backend
python manage.py createsuperuser
```

Or use the helper script:
```bash
python create_user.py
```

---

## API Documentation

Interactive Swagger UI: http://localhost:8000/api/docs/
