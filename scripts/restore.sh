#!/usr/bin/env bash
# Hairven restore (run ONCE on the VPS during first deploy).
# Usage: ./restore.sh /path/to/hairven-YYYYMMDD-HHMMSS
# Assumes: repo cloned, web/.env filled, stack NOT yet started.
set -euo pipefail
BACKUP_DIR="${1:?pass the backup folder, e.g. ./restore.sh ~/hairven-20260101-120000}"
COMPOSE="docker compose -f docker-compose.prod.yml"

echo "[1/4] Starting database only..."
$COMPOSE up -d postgres
echo "Waiting for Postgres..."
until docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do sleep 2; done

echo "[2/4] Restoring database..."
docker compose -f docker-compose.prod.yml exec -T postgres dropdb -U postgres --if-exists hair_heaven
docker compose -f docker-compose.prod.yml exec -T postgres createdb -U postgres hair_heaven
docker compose -f docker-compose.prod.yml exec -T postgres pg_restore -U postgres -d hair_heaven < "$BACKUP_DIR/database.dump"

echo "[3/4] Restoring uploads..."
docker volume create hairven_mediadata >/dev/null 2>&1 || true
# Project name may prefix the volume; find the real one:
VOL="$(docker volume ls --format '{{.Name}}' | grep -E 'mediadata' | head -n1)"
unzip -o -q "$BACKUP_DIR/uploads.zip" -d /tmp/hairven-uploads
docker run --rm -v "$VOL:/to" -v /tmp/hairven-uploads:/from alpine sh -c "cp -r /from/* /to/ && ls /to | head"
rm -rf /tmp/hairven-uploads

echo "[4/4] Starting full stack..."
$COMPOSE up -d --build
echo "Done. Check: docker compose -f docker-compose.prod.yml ps"
echo "Then open https://yourdomain and /api/health (expect db:up)."
