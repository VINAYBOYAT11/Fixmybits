# FixMyBits – Non-Profit Cybersecurity Marketplace

A full-stack platform where startups post bug-bounty projects and vetted security testers submit reports. It features a complete role-based workflow, asynchronous Celery email notifications, advanced query filtering, and secure password-reset pipelines.

---

## 📦 Monorepo Structure

This repository uses a modern Monorepo architecture containing both the backend API and the frontend UI.

```text
fixmybits/
├── backend/            # Django REST Framework API (Powered by Supabase PostgreSQL)
│   ├── apps/           # Core applications (users, projects, reports, tasks)
│   ├── fixmybits/      # Core settings and routing
│   └── manage.py       
├── frontend/           # Next.js React UI 
└── README.md
```

---

## 🚀 Backend Quick Start

The backend is a robust Python Django application.

### 1. CD into the Backend & Create Environment

```bash
cd backend

# Create Virtual Environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your actual values:
#   SECRET_KEY, DATABASE_URL, REDIS_URL, CLOUDINARY_*, EMAIL_*
```

### 4. Database Setup (Supabase)

This app is natively configured to run on a managed **Supabase PostgreSQL** cloud instance. Ensure your Supabase `DATABASE_URL` is in your `.env`.

```bash
# Push schema to Supabase
python manage.py makemigrations users projects reports
python manage.py migrate

# Seed dummy data (creates 3 startups and 10 testers)
python seed_data.py

# Create a superuser (admin)
python manage.py createsuperuser
```

### 5. Start the development server

```bash
python manage.py runserver
```

* API is available at: `http://127.0.0.1:8000/api/`  
* API Swagger Docs: `http://127.0.0.1:8000/api/docs/`
* Django Admin: `http://127.0.0.1:8000/admin/`

---

## ⚙️ Running Celery (Async Emails)

Celery requires Redis. Make sure Redis is running locally, then open a separate terminal:

```bash
cd backend
venv\Scripts\activate

# Start Celery worker (Windows users must append --pool=solo)
celery -A fixmybits worker --loglevel=info --pool=solo
```

---

## ☁️ Cloudinary (Screenshot Uploads)

Bug reports support direct screenshot file uploads. Add your Cloudinary API keys to your `.env` to allow successful file storage:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🔐 API Reference

For a full list of interactive endpoints, launch the server and visit `http://127.0.0.1:8000/api/docs/`. It documents all Auth, Startup, Tester, and Admin workflows automatically.

---

## 🏃 Production Deployment

The backend contains a production-ready `Dockerfile` and `docker-compose.yml`.

```bash
cd backend
docker-compose up --build -d
```
