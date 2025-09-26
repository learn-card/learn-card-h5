#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[error] DATABASE_URL is not set. Export your Supabase/Postgres connection string first." >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "[error] psql command not found. Install libpq/psql (e.g. brew install libpq && brew link --force libpq)." >&2
  exit 1
fi

shopt -s nullglob
files=(db/migrations/*.sql)
if (( ${#files[@]} == 0 )); then
  echo "[warn] No SQL files found under db/migrations" >&2
  exit 0
fi

echo "Applying ${#files[@]} migration(s) to remote database..."
for file in "${files[@]}"; do
  echo "--- Applying $file"
  PSQLRC= psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
  echo "--- Done $file"

done

echo "Migrations finished successfully."
