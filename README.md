<div align="center">

# 🛡️ FixMyBits

### Non-Profit Cybersecurity Marketplace

_Connecting startups with skilled security testers — one bug at a time._

![Python](https://img.shields.io/badge/Python-3.11+-3776ab?style=flat-square&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-4.2-092e20?style=flat-square&logo=django&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=flat-square)
![Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla%20JS-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker&logoColor=white)

</div>

---

## 📖 What Is FixMyBits?

FixMyBits is a **full-stack, role-based web application** that acts as a non-profit bug-bounty marketplace:

- 🚀 **Startups** post security testing projects and review submitted vulnerability reports
- 🔍 **Testers** browse open projects, apply, and submit detailed bug reports with screenshots
- 🛡️ **Admins** approve users, review projects, manage tester assignments, and audit all reports

Every user registration requires **admin approval** before access is granted — keeping the platform trusted and vetted.

---

## 🗂️ Project Structure

```
fixmybits/                          ← Monorepo root
│
├── 📂 backend/                     ← Django REST Framework API
│   ├── apps/
│   │   ├── users/                  ← Auth, User model, Tester/Startup profiles
│   │   ├── projects/               ← Projects, Applications, role-specific views
│   │   ├── reports/                ← Bug reports, screenshots, severity tracking
│   │   └── tasks/                  ← Celery async email tasks
│   ├── fixmybits/
│   │   ├── settings.py             ← Django settings (env-driven)
│   │   ├── urls.py                 ← Root URL router
│   │   ├── celery.py               ← Celery app config
│   │   └── wsgi.py                 ← WSGI entry point
│   ├── manage.py
│   ├── seed_data.py                ← Seeds 3 startups + 10 testers for dev
│   ├── create_user.py              ← CLI tool to create admin users
│   ├── requirements.txt
│   ├── Dockerfile                  ← Multi-stage production Docker image
│   ├── docker-compose.yml          ← Full stack: Django + Postgres + Redis + Celery
│   └── Procfile                    ← Heroku / Railway deployment config
│
├── 📂 frontend/                    ← Vanilla HTML/CSS/JS Single-Page App
│   ├── index.html                  ← Single HTML shell (auth + dashboard views)
│   ├── css/
│   │   ├── variables.css           ← Design tokens (colors, spacing, shadows)
│   │   ├── base.css                ← Reset, typography, keyframe animations
│   │   ├── components.css          ← Buttons, forms, badges, toasts, cards
│   │   ├── layout.css              ← Navbar, sidebar, dashboard grid
│   │   └── pages.css               ← Auth page & page-specific styles
│   └── js/
│       ├── app.js                  ← Entry point: bootstraps app, wires globals
│       ├── config.js               ← Constants, default URL, global state object
│       ├── api.js                  ← HTTP client (JSON + multipart, JWT inject)
│       ├── auth.js                 ← Login, signup, logout, session restore
│       ├── router.js               ← Sidebar builder, page routing, view transitions
│       ├── ui.js                   ← Toasts, health check indicator
│       ├── utils.js                ← Pure helpers: $(), escHtml, fmtDate, badges
│       └── dashboards/
│           ├── tester.js           ← Tester: profile, projects, applications, reports
│           ├── startup.js          ← Startup: profile, projects, applications, reports
│           └── admin.js            ← Admin: overview, users, projects, reports, apps
│
├── README.md                       ← ← ← You are here
└── .gitignore
```

---

## ⚡ Tech Stack

| Layer            | Technology                           | Purpose                                      |
| ---------------- | ------------------------------------ | -------------------------------------------- |
| **Backend**      | Django 4.2 + DRF                     | REST API, ORM, admin panel                   |
| **Auth**         | SimpleJWT                            | JWT access (1 day) + refresh (7 days) tokens |
| **Database**     | PostgreSQL (Supabase) / SQLite (dev) | Primary data store                           |
| **Task Queue**   | Celery + Redis                       | Async email notifications                    |
| **File Storage** | Cloudinary / local `media/`          | Screenshot & logo uploads                    |
| **API Docs**     | drf-spectacular (Swagger)            | Auto-generated interactive docs              |
| **Frontend**     | Vanilla HTML + CSS + JS ES Modules   | Zero-framework SPA                           |
| **Fonts**        | Google Fonts — Inter                 | UI typography                                |
| **Deployment**   | Docker + Gunicorn + WhiteNoise       | Production-ready containers                  |

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- pip
- Git

### 1 — Clone & enter the repo

```bash
git clone https://github.com/your-org/fixmybits.git
cd fixmybits
```

### 2 — Set up the backend

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate       # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env          # Windows
# cp .env.example .env           # macOS / Linux
# → Edit .env: set SECRET_KEY, DATABASE_URL, etc.

# Apply database migrations
python manage.py migrate

# (Optional) Seed demo data — 3 startups + 10 testers
python seed_data.py

# Create your first admin account
python manage.py createsuperuser

# Start the Django dev server
python manage.py runserver
```

> Backend is now live at **`http://127.0.0.1:8000`**

### 3 — Serve the frontend

```bash
# From the repo root — open a new terminal
cd frontend
python -m http.server 5500
```

> Frontend is now live at **`http://127.0.0.1:5500`**

### 4 — Open in browser

```
http://127.0.0.1:5500/index.html
```

---

## 🔑 Default Dev Credentials

> These are seeded by `seed_data.py`. All seeded passwords are `password123`.

| Role        | Email                  | Password      |
| ----------- | ---------------------- | ------------- |
| **Admin**   | `vinay@admin.com`      | `Admin@1234`  |
| **Startup** | `startup1@example.com` | `password123` |
| **Startup** | `startup2@example.com` | `password123` |
| **Tester**  | `tester1@example.com`  | `password123` |
| **Tester**  | `tester2@example.com`  | `password123` |

> ⚠️ Change all passwords before any public deployment.

---

## 🔄 User & Project Workflow

```
[Startup registers]  →  Admin approves  →  Startup creates project
                                         →  Project submitted (→ open)
                                         →  Testers apply
                                         →  Admin accepts application
                                         →  Project moves to in_progress
                                         →  Tester submits bug reports
                                         →  Admin reviews reports (approve/spam/duplicate)
                                         →  Startup marks approved bugs as fixed
                                         →  Startup marks project completed
```

### Project Status Flow

```
draft → pending_approval → open → in_progress → completed
                        ↘ rejected
```

### Report Status Flow

```
pending_admin_review → approved → fixed
                    ↘ spam
                    ↘ duplicate
```

---

## 🌐 API Endpoints Overview

| Group   | Base Path       | Description                                      |
| ------- | --------------- | ------------------------------------------------ |
| Auth    | `/api/auth/`    | Register, login, logout, me, password reset      |
| Tester  | `/api/tester/`  | Profile, open projects, apply, assigned, reports |
| Startup | `/api/startup/` | Profile, projects CRUD, applications, reports    |
| Admin   | `/api/admin/`   | Stats, pending queues, approve/reject actions    |
| Health  | `/healthz/`     | Liveness + DB readiness probe                    |
| Docs    | `/api/docs/`    | Interactive Swagger UI (all endpoints)           |

> Full interactive docs: **`http://127.0.0.1:8000/api/docs/`**

---

## 🐳 Docker / Production Deployment

### Run the full stack with Docker Compose

```bash
cd backend

# Copy and fill in your production env values
copy .env.example .env

# Build and start all services (Django + Postgres + Redis + Celery)
docker-compose up --build -d

# Check all services are healthy
docker-compose ps

# View logs
docker-compose logs -f web
```

Services started:
| Service | Port | Description |
|---|---|---|
| `web` | `8000` | Django + Gunicorn |
| `db` | internal | PostgreSQL 15 |
| `redis` | internal | Redis 7 |
| `celery` | — | Async worker |

### Deploy to Heroku / Railway

```bash
# The Procfile is already configured:
# web:    gunicorn fixmybits.wsgi:application
# worker: celery -A fixmybits worker
```

---

## ⚙️ Environment Variables

All configuration lives in `backend/.env`. Copy from `backend/.env.example`:

```env
# Core Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_URL=sqlite:///db.sqlite3
# DATABASE_URL=postgres://user:pass@host:5432/dbname

# CORS — add your frontend origin
CORS_ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500

# Celery / Redis
CELERY_BROKER_URL=redis://localhost:6379/1

# Cloudinary (optional — for screenshot uploads in production)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (console backend for dev, SMTP for prod)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

---

## 🗄️ Database Models

```
User (custom AbstractBaseUser)
  ├── role: startup | tester | admin
  ├── is_approved: bool (default False — needs admin approval)
  ├── is_banned: bool
  ├── StartupProfile (1:1)
  │   ├── company_name, website, logo
  └── TesterProfile (1:1)
      ├── skills[], tools[] (JSONField arrays)
      ├── experience_level: beginner | intermediate | advanced
      ├── bio
      └── reputation_score (incremented +10 on each approved report)

Project
  ├── startup (FK → User)
  ├── name, in_scope, out_of_scope, testing_rules (JSON)
  ├── status: draft→pending_approval→open→in_progress→completed|rejected
  ├── assigned_tester (FK → User, nullable)
  └── rejection_reason

Application
  ├── project (FK → Project)
  ├── tester (FK → User)
  └── status: pending | accepted | rejected | cancelled

Report
  ├── project (FK → Project)
  ├── tester (FK → User)
  ├── title, description, steps_to_reproduce
  ├── severity: Low | Medium | High | Critical
  ├── screenshot (ImageField)
  ├── drive_link (URLField, optional)
  ├── status: pending_admin_review → approved | spam | duplicate → fixed
  └── admin_feedback
```

---

## 📧 Async Email Notifications (Celery)

The following emails fire automatically via Celery tasks:

| Trigger                     | Email Sent To    |
| --------------------------- | ---------------- |
| Tester application accepted | Tester + Startup |
| Tester application rejected | Tester           |
| Project completed           | Assigned tester  |
| Report approved             | Tester           |
| Password reset requested    | User             |

> In development, `CELERY_TASK_ALWAYS_EAGER=True` runs tasks **synchronously** (no Redis needed).
> In production, set `CELERY_TASK_ALWAYS_EAGER=False` and run the Celery worker.

---

## 🔐 Security Notes

- All API endpoints require `Authorization: Bearer <token>` except `/api/auth/login/` and `/api/auth/register/`
- JWT tokens expire in **1 day** (access) and **7 days** (refresh)
- Refresh tokens are **blacklisted on rotation** (prevents token reuse)
- Passwords are hashed with **PBKDF2-SHA256** (Django default — never stored in plain text)
- CORS is **whitelist-only** — only explicitly listed origins are allowed
- File uploads are restricted to **images only** (`accept="image/*"`)
- Admin accounts are **auto-approved** on creation; all others require manual admin approval

---

## 🧪 Testing & Seeding

```bash
cd backend

# Seed 3 startups + 10 testers (all approved, password: password123)
python seed_data.py

# Reset a user password from CLI
python manage.py shell -c "
from apps.users.models import User
u = User.objects.get(email='vinay@admin.com')
u.set_password('Admin@1234')
u.save()
print('Done!')
"

# Run e2e API test suite
python e2e_test.py

# Test password reset flow
python test_pw_reset.py
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clear commit messages
4. Push to your fork and open a Pull Request
5. Ensure no duplicate functions exist in dashboard JS files
6. Test both tester, startup, and admin flows before submitting

---

## 📄 License

This project is open-source and free to use for non-profit and educational purposes.

---

<div align="center">
<sub>Built with ❤️ for the cybersecurity community · FixMyBits © 2024</sub>
</div>
