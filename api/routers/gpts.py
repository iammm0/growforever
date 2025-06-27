from fastapi import APIRouter, Body, HTTPException
from services.gpt_service import generate_text
from services.gnn_service import parse_text_to_graph  # 假设你有 GNN 解析服务

router = APIRouter(prefix="/gpt", tags=["GPT"])

@router.post("/expand", summary="根据用户提示扩展图结构")
def expand_prompt(
    prompt: str = Body(..., embed=True, description="用户输入的待扩展文本"),
    max_length: int = Body(200, description="生成文本的最长长度")
):
    try:
        generated_text = generate_text(prompt, max_length=max_length)
        graph = parse_text_to_graph(generated_text)
        return {
            "prompt": prompt,
            "generated_text": generated_text,
            "graph": graph
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
