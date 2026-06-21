#!/bin/sh
set -e
echo "[silverfox] migrate..."
# --fake-initial: tables may already exist if migrate ran during an earlier
# Nixpacks build or from a concurrent container start on redeploy.
python backend/manage.py migrate --noinput --fake-initial

PORT="${PORT:-8080}"

# Seed/sync can take several minutes on first deploy — run in background so
# Railway healthcheck (/health/) passes once gunicorn is listening.
(
  echo "[silverfox] background: ensure_admin, seed, sync..."
  python backend/manage.py ensure_admin || echo "[silverfox] WARN: ensure_admin failed"
  python backend/manage.py seed_mens_catalog || echo "[silverfox] WARN: seed_mens_catalog failed"
  python backend/manage.py sync_catalog || echo "[silverfox] WARN: sync_catalog failed"
  echo "[silverfox] background catalog tasks finished"
) &

echo "[silverfox] gunicorn on 0.0.0.0:${PORT}"
exec gunicorn --chdir backend core.wsgi:application --bind "0.0.0.0:${PORT}" --workers 2 --timeout 120 --access-logfile - --error-logfile -
