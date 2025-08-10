from fastapi.testclient import TestClient

import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from fastapi import FastAPI
import types
sys.modules.setdefault('openai', types.SimpleNamespace())
sys.modules.setdefault('transformers', types.SimpleNamespace(
    pipeline=lambda *a, **k: None,
    AutoModelForSeq2SeqLM=object,
    AutoTokenizer=object,
))
from api.routers.text import router as text_router
from api.services.gpt_service import GPTService, get_gpt_service

app = FastAPI()
app.include_router(text_router)

class DummyService(GPTService):
    def generate(self, prompt: str, **kwargs) -> str:
        return "dummy response"

app.dependency_overrides[get_gpt_service] = lambda: DummyService()
client = TestClient(app)

def test_generate_text():
    resp = client.post("/text/generate", json={"prompt": "hello"})
    assert resp.status_code == 200
    assert resp.json()["text"] == "dummy response"
