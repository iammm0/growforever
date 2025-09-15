"""支持多种模型提供商的远程 GPT 聊天服务封装。"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence, Dict, List, Union


import httpx


@dataclass
class Message:
    """简易聊天消息结构"""

    role: str
    content: str


class PromptBuilder:
    """简单的 Prompt 构造器，将用户输入追加到历史中"""

    def build(self, history: List[Message], user_input: str) -> List[Dict[str, str]]:
        messages = [{"role": m.role, "content": m.content} for m in history]
        messages.append({"role": "user", "content": user_input})
        return messages

# 支持的远程模型提供商映射表
_PROVIDER_MAP = {
    "deepseek": {"model": "deepseek-chat", "api_key_env": "DEEPSEEK_API_KEY"},
    "grok3": {"model": "grok-3", "api_key_env": "GROK3_API_KEY"},
    "gpt4": {"model": "gpt-4", "api_key_env": "CHATGPT_API_KEY"},
}


class RemoteGPTService:
    """统一的远程聊天补全服务，可切换不同提供商"""

    def __init__(
        self,
        prompt_builder: PromptBuilder,
        provider: str,
        *,
        api_key: str | None = None,
        base_url: str = "https://jeniya.cn",
        endpoint: str = "/v1/chat/completions",
        system_prompt_path: Union[str, Path, None] = None,
    ):
        provider = provider.lower()
        if provider not in _PROVIDER_MAP:
            raise ValueError(f"Unsupported provider: {provider}")
        cfg = _PROVIDER_MAP[provider]
        self.model = cfg["model"]
        if api_key is None:
            api_key = os.getenv(cfg["api_key_env"], "")
        self.prompt_builder = prompt_builder
        self.base_url = base_url.rstrip("/")
        self.endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
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
        
    async def chat_reply(
        self,
        history: Sequence[Message],
        user_input: str,
        temperature: float = 1.3,
        max_tokens: int = 20,
    ) -> str:
        """根据聊天历史与用户输入获取模型回复"""

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