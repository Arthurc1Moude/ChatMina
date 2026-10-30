#!/bin/sh
set -e

if [ "${MINA_FETCH_MODELS}" = "1" ]; then
  echo "Fetching adapters from Cloud Storage…"
  python fetch_models.py
fi

exec uvicorn app:app --host 0.0.0.0 --port "${PORT:-8080}"
