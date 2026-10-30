# ChatMina model API — CPU-oriented container for Cloud Run.
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Minimal runtime tooling (curl is used by the container health check).
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install the CPU build of torch first, then the remaining dependencies.
COPY requirements.txt ./
RUN pip install --no-cache-dir torch==2.14.1 --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Service code.
COPY . ./
RUN chmod +x entrypoint.sh

# Default locations for the LoRA adapters. Mount or COPY model files here.
# Set MINA_FETCH_MODELS=1 with MINA_*_GCS to download adapters at startup.
ENV MINA_BASE_MODEL="HuggingFaceTB/SmolLM2-360M" \
    MINA_LUNA_ADAPTER="/models/mina-luna" \
    MINA_NUMBA_ADAPTER="/models/mina-numba" \
    MINA_FETCH_MODELS="0" \
    MINA_DEVICE="cpu" \
    MINA_CORS_ORIGINS="*"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8080/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
