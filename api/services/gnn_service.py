from abc import ABC, abstractmethod
from typing import Any, Dict

import requests
from transformers import AutoModel, AutoTokenizer

from api.core.config import settings

SERVICE_TYPES = ["default", "remote"]                  # GNN

class GNNService(ABC):
    @abstractmethod
    def encode(self, graph: Dict[str, Any]) -> Dict[str, Any]:
        """对图做编码，返回可能附带的 embeddings 或预测结果"""
        pass


class DefaultGNNService(GNNService):
    """本地 Graph Transformer 编码器"""

    def __init__(self):
        self._tokenizer = AutoTokenizer.from_pretrained(settings.GNN_MODEL_PATH)
        self._model = AutoModel.from_pretrained(settings.GNN_MODEL_PATH).to(
            "cuda" if settings.USE_CUDA else "cpu"
        )

    def encode(self, graph: Dict[str, Any]) -> Dict[str, Any]:
        # 假设模型接受 JSON 序列化的图
        inputs = self._tokenizer(
            str(graph), return_tensors="pt", truncation=True, padding=True
        ).to(self._model.device)
        outs = self._model(**inputs)
        # 返回最后一层 hidden state 平均池化作为图向量
        emb = outs.last_hidden_state.mean(dim=1).detach().cpu().tolist()
        return {"embedding": emb}


class RemoteGNNService(GNNService):
    """调用外部 HTTP GNN 服务"""

    def __init__(self):
        self._url = settings.GNN_API_URL
        self._headers = {"Authorization": f"Bearer {settings.GNN_API_KEY}"} if settings.GNN_API_KEY else {}

    def encode(self, graph: Dict[str, Any]) -> Dict[str, Any]:
        resp = requests.post(self._url, json={"graph": graph}, headers=self._headers, timeout=20)
        resp.raise_for_status()
        return resp.json()


def get_gnn_service() -> GNNService:
    t = settings.GNN_SERVICE_TYPE.lower()
    if t == "remote":
        return RemoteGNNService()
    return DefaultGNNService()