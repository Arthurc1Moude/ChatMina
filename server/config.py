"""Runtime configuration for the ChatMina model service.

All values are read from environment variables so the same image can run
locally, on Cloud Run, or against adapters stored in Cloud Storage.
"""
import os


def _split_origins(raw: str) -> list[str]:
    origins = [item.strip() for item in raw.split(",") if item.strip()]
    return origins or ["*"]


# Base model used by every LoRA adapter.
BASE_MODEL_NAME = os.getenv("MINA_BASE_MODEL", "HuggingFaceTB/SmolLM2-360M")

# Local directories (or GCS URI mounted via gcsfuse) holding each adapter.
LUNA_ADAPTER_PATH = os.getenv("MINA_LUNA_ADAPTER", "/models/mina-luna")
NUMBA_ADAPTER_PATH = os.getenv("MINA_NUMBA_ADAPTER", "/models/mina-numba")

# Comma-separated allowed origins for CORS. Use "*" for open access.
CORS_ORIGINS = _split_origins(os.getenv("MINA_CORS_ORIGINS", "*"))

# Hardware device. The reference models are intended to run on CPU.
DEVICE = os.getenv("MINA_DEVICE", "cpu")

# Cap the response length to protect CPU latency.
HARD_MAX_NEW_TOKENS = int(os.getenv("MINA_HARD_MAX_TOKENS", "320"))

# Model identifiers exposed through the API.
MODEL_LUNA = "mina1-luna"
MODEL_NUMBA = "mina1-numba"

ADAPTERS = {
    MODEL_LUNA: LUNA_ADAPTER_PATH,
    MODEL_NUMBA: NUMBA_ADAPTER_PATH,
}
