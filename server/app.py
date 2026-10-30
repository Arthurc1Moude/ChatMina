"""ChatMina model API.

OpenAI-compatible chat completions backed by the local Mina LoRA adapters.
"""
import json
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from config import ADAPTERS, CORS_ORIGINS, MODEL_LUNA, MODEL_NUMBA
from model_manager import ModelManager
from schemas import ChatCompletionRequest

manager = ModelManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    manager.load()
    yield


app = FastAPI(
    title="ChatMina Model API",
    version="1.0.0",
    description="Serves the Mina1 Luna and Mina1 Numba conversational models.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def sse(payload: dict) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def new_completion_id() -> str:
    return f"chatcmpl-{uuid.uuid4().hex[:24]}"


def base_chunk(completion_id: str, created: int, model: str, content: str, finish_reason):
    return {
        "id": completion_id,
        "object": "chat.completion.chunk",
        "created": created,
        "model": model,
        "choices": [
            {
                "index": 0,
                "delta": {"content": content},
                "finish_reason": finish_reason,
            }
        ],
    }


@app.get("/health")
def health():
    return {
        "status": "ready" if manager.loaded else "loading",
        "models": list(ADAPTERS.keys()),
    }


@app.get("/v1/models")
def list_models():
    return {
        "object": "list",
        "data": [
            {
                "id": model_id,
                "object": "model",
                "created": 0,
                "owned_by": "chatmina",
            }
            for model_id in ADAPTERS
        ],
    }


@app.post("/v1/chat/completions")
def create_completion(request: ChatCompletionRequest):
    if request.model not in ADAPTERS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model '{request.model}'. Available: {', '.join(ADAPTERS)}.",
        )

    if not any(message.role == "user" and message.content.strip() for message in request.messages):
        raise HTTPException(status_code=400, detail="At least one user message is required.")

    if request.stream:
        def event_generator():
            completion_id = new_completion_id()
            created = int(time.time())

            yield sse(
                {
                    "id": completion_id,
                    "object": "chat.completion.chunk",
                    "created": created,
                    "model": request.model,
                    "choices": [
                        {
                            "index": 0,
                            "delta": {"role": "assistant", "content": ""},
                            "finish_reason": None,
                        }
                    ],
                }
            )

            try:
                for piece in manager.stream(
                    request.messages,
                    request.model,
                    request.max_tokens,
                ):
                    yield sse(base_chunk(completion_id, created, request.model, piece, None))
            except Exception as exc:  # surface generation failures to the client
                error_payload = {
                    "error": {
                        "message": str(exc),
                        "type": "model_error",
                    }
                }
                yield sse(error_payload)
                yield "data: [DONE]\n\n"
                return

            yield sse(base_chunk(completion_id, created, request.model, "", "stop"))
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    content = manager.generate(request.messages, request.model, request.max_tokens)
    prompt = manager.build_prompt(request.messages)
    prompt_tokens = len(manager.tokenizer.encode(prompt))
    completion_tokens = len(manager.tokenizer.encode(content))

    return {
        "id": new_completion_id(),
        "object": "chat.completion",
        "created": int(time.time()),
        "model": request.model,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
        },
    }


@app.get("/")
def root():
    return {
        "service": "ChatMina Model API",
        "models": [MODEL_LUNA, MODEL_NUMBA],
        "docs": "/docs",
    }
