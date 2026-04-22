# FixMyBits

A non-profit cybersecurity marketplace connecting startups with security testers.

## Project Structure

```
fixmybits/
├── backend/              # Django REST API
│   ├── apps/
│   │   ├── users/        # Auth, user model, startup/tester profiles
│   │   ├── projects/     # Projects, applications, all role views
│   │   ├── reports/      # Bug report chat messages
│   │   └── tasks/        # Celery async email tasks
│   ├── fixmybits/        # Django settings, URLs, Celery config
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
│
├── Landing page design/  # React + TypeScript frontend (Vite)
│   └── src/app/
│       ├── components/   # Shared UI + layout components
│       ├── lib/          # API client, auth helpers
│       └── pages/        # admin/, startup/, tester/, auth pages
│
├── assets/               # Brand assets
│   ├── logo/             # Logo files and variants
│   └── video/            # Demo videos
│
├── docs/                 # Project documentation and handover notes
│   └── archives/         # Archived files (zip, old databases)
│
├── secrets/              # Credential files — NEVER committed (gitignored)
│
├── tools/                # Internal dev scripts (Bedrock, profile checks)
│
├── graphify/             # Knowledge graph tool (submodule)
├── graphify-out/         # Auto-generated graph output
│
├── start-both.sh         # Start backend + frontend together
├── .env                  # Root env (not committed)
└── README.md
```

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # fill in values
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd "Landing page design"
npm install
cp .env.example .env.local     # fill in VITE_API_BASE_URL
npm run dev
```

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | Django 5, Django REST Framework, SimpleJWT      |
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS        |
| Database  | SQLite (dev) / PostgreSQL (prod)                |
| Auth      | JWT (access + refresh tokens, blacklist)        |
| Email     | Celery + Redis (async tasks)                    |
| Storage   | Local (dev) / Cloudinary (prod)                 |

## User Roles

- **Startup** — creates projects, reviews bug reports, marks issues fixed
- **Tester** — browses open projects, applies, submits bug reports
- **Admin** — approves users/projects, reviews reports, assigns testers

## API Docs

Start the backend and visit: `http://localhost:8000/api/docs/`

## Environment Variables

See `backend/.env.example` and `Landing page design/.env.example` for all required variables.

## Running Both Servers

```bash
bash start-both.sh
```

Or see `docs/RUN_SERVERS.md` for manual instructions and troubleshooting.
