#!/bin/sh
set -e
echo "[silverfox] migrate..."
# --fake-initial: tables may already exist if migrate ran during an earlier
# Nixpacks build or from a concurrent container start on redeploy.
python backend/manage.py migrate --noinput --fake-initial
echo "[silverfox] admin + catalog..."
python backend/manage.py ensure_admin
python backend/manage.py seed_mens_catalog
python backend/manage.py sync_catalog
PORT="${PORT:-8080}"
echo "[silverfox] gunicorn on 0.0.0.0:${PORT}"
exec gunicorn --chdir backend core.wsgi:application --bind "0.0.0.0:${PORT}" --workers 2 --timeout 120 --access-logfile - --error-logfile -
