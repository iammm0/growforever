from fastapi import APIRouter, Depends

from api.schemas.text_schema import TextGenRequest, TextGenResponse
from api.services.gpt_service import GPTService, get_gpt_service

router = APIRouter(prefix="/text", tags=["text"])

@router.post("/generate", response_model=TextGenResponse, summary="生成长文本")
def generate_text(req: TextGenRequest, svc: GPTService = Depends(get_gpt_service)):
    text = svc.generate(req.prompt, max_tokens=req.max_tokens)
    return TextGenResponse(text=text)
