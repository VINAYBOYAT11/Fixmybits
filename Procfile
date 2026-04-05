web: gunicorn fixmybits.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120 --access-logfile - --error-logfile -
worker: celery -A fixmybits worker --loglevel=info --concurrency 2 -E
beat: celery -A fixmybits beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
