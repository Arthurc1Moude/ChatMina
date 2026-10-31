"""Loads the shared base model once and serves both LoRA adapters."""
from threading import Lock, Thread

from peft import PeftModel
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer

from config import (
    ADAPTERS,
    BASE_MODEL_NAME,
    DEVICE,
    HARD_MAX_NEW_TOKENS,
    MODEL_LUNA,
    MODEL_NUMBA,
)
from schemas import ChatMessage

# Sampling profiles mirror the reference chat scripts in MiniModels.
GENERATION_PROFILES: dict[str, dict[str, float]] = {
    MODEL_LUNA: {
        "temperature": 0.7,
        "top_p": 0.9,
        "repetition_penalty": 1.1,
        "max_new_tokens": 256,
    },
    MODEL_NUMBA: {
        "temperature": 0.4,
        "top_p": 0.85,
        "repetition_penalty": 1.15,
        "no_repeat_ngram_size": 3,
        "max_new_tokens": 128,
    },
}


class ModelManager:
    def __init__(self) -> None:
        self._lock = Lock()
        self.tokenizer: AutoTokenizer | None = None
        self.model = None
        self.loaded = False

    def load(self) -> None:
        self.tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME)
        self.model = AutoModelForCausalLM.from_pretrained(BASE_MODEL_NAME).to(DEVICE)

        # Attach both adapters to the single base model and switch per request.
        self.model = PeftModel.from_pretrained(
            self.model,
            ADAPTERS[MODEL_LUNA],
            adapter_name=MODEL_LUNA,
            local_files_only=True,
            is_trainable=False
        )
        self.model = PeftModel.from_pretrained(
            self.model,
            ADAPTERS[MODEL_NUMBA],
            adapter_name=MODEL_NUMBA,
            local_files_only=True,
            is_trainable=False
        )
        self.model.eval()
        self.loaded = True

    @staticmethod
    def build_prompt(messages: list[ChatMessage]) -> str:
        prompt = ""
        for message in messages:
            if message.role == "system":
                continue
            speaker = "user" if message.role == "user" else "assistant"
            prompt += f"{speaker}: {message.content}\n"
        prompt += "assistant: "
        return prompt

    def _run_generation(self, **kwargs) -> None:
        with torch.no_grad():
            self.model.generate(**kwargs)

    def stream(
        self,
        messages: list[ChatMessage],
        model_id: str,
        max_tokens: int | None = None,
    ):
        if not self.loaded or self.model is None or self.tokenizer is None:
            raise RuntimeError("Model service is not ready.")

        profile = dict(GENERATION_PROFILES[model_id])
        requested = max_tokens if max_tokens is not None else int(profile["max_new_tokens"])
        profile["max_new_tokens"] = min(requested, HARD_MAX_NEW_TOKENS)

        prompt = self.build_prompt(messages)
        inputs = self.tokenizer(prompt, return_tensors="pt").to(DEVICE)

        streamer = TextIteratorStreamer(
            self.tokenizer,
            skip_prompt=True,
            skip_special_tokens=True,
        )
        generation_kwargs = dict(
            **inputs,
            streamer=streamer,
            do_sample=True,
            **profile,
        )

        with self._lock:
            self.model.set_adapter(model_id)
            thread = Thread(target=self._run_generation, kwargs=generation_kwargs)
            thread.start()

            emitted = 0
            buffer = ""
            for text in streamer:
                buffer += text

                if emitted == 0 and buffer.startswith("user:"):
                    break

                marker_index = buffer.find("\nuser:")
                clean = buffer if marker_index == -1 else buffer[:marker_index]

                if len(clean) > emitted:
                    yield clean[emitted:]
                    emitted = len(clean)

                if marker_index != -1:
                    break

            thread.join(timeout=2)

    def generate(
        self,
        messages: list[ChatMessage],
        model_id: str,
        max_tokens: int | None = None,
    ) -> str:
        return "".join(self.stream(messages, model_id, max_tokens)).strip()
