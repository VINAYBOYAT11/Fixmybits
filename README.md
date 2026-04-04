# FixMyBits – Non-Profit Cybersecurity Marketplace Backend

A Django 4.2 REST API powering **FixMyBits**, a platform where startups post bug-bounty
projects and vetted security testers submit reports.

---

## 📦 Project Structure

```
fixmybits/
├── manage.py
├── requirements.txt
├── .env.example
├── fixmybits/          # Django project package
│   ├── settings.py
│   ├── urls.py
│   ├── celery.py
│   └── __init__.py
└── apps/
    ├── users/          # Custom user model, auth, profiles
    ├── projects/       # Projects, Applications; all role-scoped URLs
    ├── reports/        # Bug reports with Cloudinary screenshot upload
    └── tasks/          # Celery email tasks
```

---

## 🚀 Quick Start

### 1. Clone & create a virtual environment

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
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

### 4. Run database migrations

```bash
python manage.py makemigrations users projects reports
python manage.py migrate
```

### 5. Create a superuser (admin)

```bash
python manage.py createsuperuser
# Enter email and password when prompted
```

### 6. Start the development server

```bash
python manage.py runserver
```

API is available at: `http://127.0.0.1:8000/api/`  
Django Admin: `http://127.0.0.1:8000/admin/`

---

## ⚙️ Running Celery

Celery requires Redis. Make sure Redis is running, then:

```bash
# Start Celery worker (separate terminal)
# Note for Windows users: Add --pool=solo to avoid multiprocessing errors!
celery -A fixmybits worker --loglevel=info --pool=solo

# Optional: Start Celery Beat for scheduled tasks
celery -A fixmybits beat --loglevel=info

# Monitor tasks with Flower (optional)
pip install flower
celery -A fixmybits flower
```

---

## 🗄️ Database

`DATABASE_URL` follows the `dj-database-url` format:

```
# PostgreSQL (Production)
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/fixmybits

# SQLite (Local Dev Fallback) 
# Leave DATABASE_URL blank or map it to sqlite explicitly to use a local db.sqlite3 file
DATABASE_URL=sqlite:///db.sqlite3
```

---

## ☁️ Cloudinary (Screenshot Uploads)

If Cloudinary env vars are set, all `Report.screenshot` uploads go to Cloudinary.
If not set, files are stored locally under `media/`.

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📬 Email Notifications

Set `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend` in production.  
For development, use the console backend (default): emails are printed to stdout.

---

## 🔐 API Endpoints

### Auth (`/api/auth/`)

| Method | Endpoint         | Description                          | Auth |
|--------|------------------|--------------------------------------|------|
| POST   | `/register/`     | Register user + create role profile  | No   |
| POST   | `/login/`        | Get JWT access + refresh tokens      | No   |
| POST   | `/logout/`       | Blacklist refresh token              | Yes  |
| POST   | `/token/refresh/`| Refresh access token                 | No   |
| GET    | `/me/`           | Current user info                    | Yes  |

### Startup (`/api/startup/`)

| Method | Endpoint                           | Description                      |
|--------|------------------------------------|----------------------------------|
| GET    | `/projects/`                       | List own projects                |
| POST   | `/projects/`                       | Create project                   |
| GET    | `/projects/{id}/`                  | Get project detail               |
| GET    | `/projects/{id}/reports/`          | List approved reports for project|
| PATCH  | `/reports/{id}/mark_fixed/`        | Mark approved report as fixed    |

### Tester (`/api/tester/`)

| Method | Endpoint                           | Description                      |
|--------|------------------------------------|----------------------------------|
| GET    | `/profile/`                        | View tester profile              |
| PUT    | `/profile/`                        | Update tester profile            |
| GET    | `/projects/open/`                  | List open projects               |
| POST   | `/projects/{id}/apply/`            | Apply to a project               |
| GET    | `/projects/assigned/`              | List assigned projects           |
| POST   | `/projects/{id}/reports/`          | Submit a bug report (multipart)  |
| GET    | `/reports/`                        | List own reports                 |

### Admin (`/api/admin/`)

| Method | Endpoint                           | Description                      |
|--------|------------------------------------|----------------------------------|
| GET    | `/pending-users/`                  | List unapproved users            |
| POST   | `/users/{id}/approve/`             | Approve a user                   |
| GET    | `/pending-projects/`               | List pending projects            |
| POST   | `/projects/{id}/approve/`          | Approve or reject project        |
| GET    | `/available-testers/`              | List approved testers            |
| POST   | `/projects/{id}/assign/`           | Assign tester to project         |
| GET    | `/pending-reports/`                | List reports pending review      |
| POST   | `/reports/{id}/review/`            | Approve/spam/duplicate a report  |

---

## 🔑 Authentication Flow

```
POST /api/auth/register/     → account created (pending approval)
POST /api/admin/users/{id}/approve/  → admin approves account
POST /api/auth/login/        → returns { "access": "...", "refresh": "..." }

# Use access token in subsequent requests:
Authorization: Bearer <access_token>
```

---

## 👥 Roles

| Role    | Description                                          |
|---------|------------------------------------------------------|
| startup | Creates projects, views approved reports             |
| tester  | Browses/applies to projects, submits bug reports     |
| admin   | Approves users/projects, assigns testers, moderates  |

---

## 🏃 Production Deployment

```bash
# Collect static files
python manage.py collectstatic --noinput

# Run with gunicorn
gunicorn fixmybits.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

Set `DEBUG=False` and configure `ALLOWED_HOSTS` appropriately.
