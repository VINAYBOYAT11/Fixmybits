# FixMyBits — Backend

Django REST API for the FixMyBits cybersecurity marketplace.

## Structure

```
backend/
├── apps/
│   ├── users/        # Auth, user model, profiles (startup/tester)
│   ├── projects/     # Projects, applications, admin views
│   ├── reports/      # Bug reports, report messages (chat)
│   └── tasks/        # Celery email tasks
├── fixmybits/
│   ├── settings.py   # Django settings (env-driven)
│   ├── urls.py       # Root URL config
│   ├── celery.py     # Celery app
│   └── wsgi.py
├── media/            # Uploaded files (dev only)
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── Procfile          # Heroku/Railway deployment
├── manage.py
└── .env.example
```

## Setup

```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your values
python manage.py migrate
python manage.py runserver
```

## Environment Variables

| Variable                | Required | Description                          |
|-------------------------|----------|--------------------------------------|
| `SECRET_KEY`            | Yes      | Django secret key                    |
| `DEBUG`                 | Yes      | `True` for dev, `False` for prod     |
| `DATABASE_URL`          | No       | Defaults to SQLite                   |
| `ALLOWED_HOSTS`         | No       | Comma-separated hosts                |
| `CORS_ALLOWED_ORIGINS`  | No       | Comma-separated frontend origins     |
| `CELERY_BROKER_URL`     | No       | Redis URL (default: localhost:6379)  |
| `EMAIL_BACKEND`         | No       | Defaults to console backend          |
| `CLOUDINARY_*`          | No       | Only needed if `USE_CLOUDINARY=True` |
| `FRONTEND_URL`          | No       | Used in password reset emails        |

## API Endpoints

| Prefix            | Description                        |
|-------------------|------------------------------------|
| `/api/auth/`      | Register, login, logout, me, reset |
| `/api/startup/`   | Startup project & report endpoints |
| `/api/tester/`    | Tester project & report endpoints  |
| `/api/admin/`     | Admin management endpoints         |
| `/api/reports/`   | Report chat messages               |
| `/api/docs/`      | Swagger UI (interactive docs)      |
| `/healthz/`       | Health check probe                 |

## Running Tests

```bash
pytest
```

## Creating a Superuser

```bash
python manage.py createsuperuser
# or use the helper script:
python create_user.py
```

## Celery (Email Tasks)

```bash
# In a separate terminal:
celery -A fixmybits worker --loglevel=info
```

> In development, `CELERY_TASK_ALWAYS_EAGER=True` runs tasks synchronously — no Redis needed.

## Docker

```bash
docker-compose up --build
```
