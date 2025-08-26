"""Async chat clients for multiple language models."""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence, Dict, Union, List
from abc import ABC

import httpx


@dataclass
class Message:
    """Simple chat message."""
    role: str
    content: str


class PromptBuilder:
    """Minimal prompt builder that appends user input to history."""

    def build(self, history: List[Message], user_input: str) -> List[Dict[str, str]]:
        messages = [{"role": m.role, "content": m.content} for m in history]
        messages.append({"role": "user", "content": user_input})
        return messages


class GenericChatClient(ABC):
    """Provide chat completion abstraction for multiple models and endpoints."""

    def __init__(
        self,
        prompt_builder: PromptBuilder,
        model: str,
        api_key: str,
        base_url: str,
        endpoint: str,
        system_prompt_path: Union[str, Path, None] = None,
    ):
        self.prompt_builder = prompt_builder
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        # load system prompt
        if system_prompt_path is None:
            project_root = Path(__file__).resolve().parents[2]
            system_prompt_path = project_root / "prompts" / "system.json"
        else:
            system_prompt_path = Path(system_prompt_path)
        with system_prompt_path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        sys_prompt = data.get("prompt")
        if not isinstance(sys_prompt, str):
            raise ValueError("system.json must contain a string `prompt` field")
        self.system_prompt = {"role": "system", "content": sys_prompt}

    async def complete(
        self,
        history: Sequence[Message],
        user_input: str,
        temperature: float = 1.0,
        max_tokens: int = 256,
    ) -> str:
        messages = [self.system_prompt]
        messages.extend(self.prompt_builder.build(list(history), user_input))
        payload: Dict[str, Union[str, int, float, List[Dict[str, str]]]] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        async with httpx.AsyncClient(base_url=self.base_url, timeout=30, follow_redirects=True) as client:
            resp = await client.post(self.endpoint, json=payload, headers=self.headers)
            resp.raise_for_status()
            data = resp.json()
        return data["choices"][0]["message"]["content"]

    async def chat_reply(
        self,
        history: Sequence[Message],
        user_input: str,
        temperature: float = 1.3,
        max_tokens: int = 20,
    ) -> str:
        return await self.complete(history, user_input, temperature, max_tokens)


class DeepSeekClient(GenericChatClient):
    """Client for the DeepSeek-R1 model."""

    def __init__(
        self,
        prompt_builder: PromptBuilder,
        api_key: str = os.getenv("DEEPSEEK_API_KEY", "sk-..."),
        system_prompt_path: Union[str, Path, None] = None,
    ):
        super().__init__(
            prompt_builder=prompt_builder,
            model="deepseek-chat",
            api_key=api_key,
            base_url="https://jeniya.cn",
            endpoint="/v1/chat/completions",
            system_prompt_path=system_prompt_path,
        )


class Grok3Client(GenericChatClient):
    """Client for the Grok3 model."""

    def __init__(
        self,
        prompt_builder: PromptBuilder,
        api_key: str = os.getenv("GROK3_API_KEY", "sk-..."),
        system_prompt_path: Union[str, Path, None] = None,
    ):
        super().__init__(
            prompt_builder=prompt_builder,
            model="grok-3",
            api_key=api_key,
            base_url="https://jeniya.cn",
            endpoint="/v1/chat/completions",
            system_prompt_path=system_prompt_path,
        )


class GPT4Client(GenericChatClient):
    """Client for the GPT-4 model."""

    def __init__(
        self,
        prompt_builder: PromptBuilder,
        api_key: str = os.getenv("CHATGPT_API_KEY", "sk-..."),
        system_prompt_path: Union[str, Path, None] = None,
    ):
        super().__init__(
            prompt_builder=prompt_builder,
            model="grok-3",
            api_key=api_key,
            base_url="https://jeniya.cn",
            endpoint="/v1/chat/completions",
            system_prompt_path=system_prompt_path,
        )
