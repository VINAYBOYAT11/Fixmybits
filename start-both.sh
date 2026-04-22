#!/bin/bash
set -e

# Resolve the repo root relative to this script
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting FixMyBits Backend & Frontend..."
echo ""

# Backend
echo "[Backend] Starting Django server on http://localhost:8000..."
cd "$REPO_ROOT/backend"
. venv/Scripts/activate 2>/dev/null || source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
echo "[Backend] PID: $BACKEND_PID"

sleep 3

# Frontend
echo ""
echo "[Frontend] Starting Vite dev server on http://localhost:5173..."
cd "$REPO_ROOT/Landing page design"
npm run dev &
FRONTEND_PID=$!
echo "[Frontend] PID: $FRONTEND_PID"

echo ""
echo "============================================"
echo "Both servers running!"
echo "Backend:  http://localhost:8000/api/docs/"
echo "Frontend: http://localhost:5173"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Wait for both
wait
