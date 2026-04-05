# ── Stage 1: build dependencies ──────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system build deps needed by psycopg2 / Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --prefix=/install --no-cache-dir -r requirements.txt

# ── Stage 2: production image ─────────────────────────────────────────────────
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Runtime system deps only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder stage
COPY --from=builder /install /usr/local

# Create a non-root user before copying app files
RUN addgroup --system django && adduser --system --ingroup django django

# Copy application source with correct ownership in one layer
COPY --chown=django:django . .

# Create staticfiles dir so collectstatic can write to it
RUN mkdir -p /app/staticfiles && chown django:django /app/staticfiles

USER django

# Collect static files (requires a placeholder SECRET_KEY at build time)
RUN SECRET_KEY=build-time-placeholder \
    DEBUG=False \
    DATABASE_URL=sqlite:////tmp/build.sqlite3 \
    python manage.py collectstatic --noinput

EXPOSE $PORT

CMD ["sh", "-c", "gunicorn fixmybits.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120 --access-logfile - --error-logfile -"]
