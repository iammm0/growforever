from abc import ABC, abstractmethod
from typing import Any

import openai
import requests
from transformers import pipeline

from api.core.config import settings
from api.services.tgt_model import get_tgt_service, Text2Graph2Text

SERVICE_TYPES = ["default", "hf", "openai", "remote"]  # GPT

class GPTService(ABC):
    @abstractmethod
    def generate(self, prompt: str, **kwargs: Any) -> str:
        """根据 prompt 生成文本"""
        pass


class DefaultGPTService(GPTService):
    """使用本地 HuggingFace 模型（text2graph2text 的 graph→text 部分）"""

    def __init__(self):
        self._svc: Text2Graph2Text = get_tgt_service()

    def generate(self, prompt: str, **kwargs: Any) -> str:
        # 复用 text2graph2text 的 graph2text
        return self._svc.graph_to_text({"nodes": [], "edges": [], "prompt": prompt})


class HFTextGenService(GPTService):
    """使用 HF transformers text-generation pipeline"""

    def __init__(self):
        self._pipe = pipeline(
            "text-generation",
            model=settings.HF_GPT_MODEL,
            device=0 if settings.USE_CUDA else -1,
        )

    def generate(self, prompt: str, **kwargs: Any) -> str:
        out = self._pipe(prompt, **kwargs)[0]["generated_text"]
        return out


class OpenAIService(GPTService):
    """使用 OpenAI Completion API"""

    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self._engine = settings.OPENAI_ENGINE

    def generate(self, prompt: str, **kwargs: Any) -> str:
        resp = openai.Completion.create(
            engine=self._engine,
            prompt=prompt,
            max_tokens=kwargs.get("max_tokens", 256),
            temperature=kwargs.get("temperature", 0.7),
        )
        return resp.choices[0].text.strip()


class RemoteGPTService(GPTService):
    """调用外部 HTTP 服务"""

    def __init__(self):
        self._url = settings.GPT_API_URL
        self._headers = {"Authorization": f"Bearer {settings.GPT_API_KEY}"} if settings.GPT_API_KEY else {}

    def generate(self, prompt: str, **kwargs: Any) -> str:
        payload = {"prompt": prompt, **kwargs}
        resp = requests.post(self._url, json=payload, headers=self._headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get("text") or data.get("generated_text", "")


def get_gpt_service() -> GPTService:
    t = settings.GPT_SERVICE_TYPE.lower()
    if t == "openai":
        return OpenAIService()
    if t == "hf":
        return HFTextGenService()
    if t == "remote":
        return RemoteGPTService()
    # fallback to default
    return DefaultGPTService()
