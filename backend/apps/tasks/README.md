# App: tasks

Celery async email tasks for FixMyBits.

All tasks use `bind=True`, `max_retries=3`, `default_retry_delay=60` (seconds).

## Tasks

| Task                                  | Triggered when                                      |
|---------------------------------------|-----------------------------------------------------|
| `send_report_approved_email`          | Admin approves a bug report                         |
| `send_project_assigned_email`         | Admin assigns a tester to a project                 |
| `send_application_rejected_email`     | Admin rejects a tester application                  |
| `send_project_completed_email`        | Startup marks a project as completed                |
| `send_project_submitted_for_approval_email` | Startup submits a project for admin review  |
| `send_project_approved_email`         | Admin approves a project (→ open)                   |
| `send_password_reset_email`           | User requests a password reset                      |

## Dev mode

In development, `CELERY_TASK_ALWAYS_EAGER=True` (set in `settings.py`) runs all tasks synchronously inline — no Redis or Celery worker needed.

## Production

```bash
celery -A fixmybits worker --loglevel=info
```

Requires Redis at `CELERY_BROKER_URL` (default: `redis://localhost:6379/1`).
