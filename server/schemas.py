"""Pydantic request schemas (OpenAI-compatible subset)."""
from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(min_length=0)


class ChatCompletionRequest(BaseModel):
    model: str
    messages: list[ChatMessage] = Field(min_length=1)
    stream: bool = True
    max_tokens: int | None = Field(default=None, ge=1, le=320)
    temperature: float | None = Field(default=None, ge=0.0, le=2.0)
