"""
文本生成相关路由
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from src.dependencies import get_model_manager, get_ollama_proxy
from src.schemas import (
    GenerateRequest, GenerateResponse,
    ChatRequest, BatchGenerateRequest
)
from src.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    """文本生成（自动识别本地模型或Ollama模型）"""
    try:
        # 判断是否使用Ollama
        use_ollama = request.use_ollama
        
        # 如果指定了模型名称，检查是否为Ollama模型
        if request.model_name and not use_ollama:
            # 检查模型是否在Ollama列表中
            ollama_proxy = get_ollama_proxy()
            if ollama_proxy is not None:
                try:
                    ollama_models = await ollama_proxy.list_models()
                    ollama_model_names = [m.get("name") for m in ollama_models]
                    if request.model_name in ollama_model_names:
                        use_ollama = True
                        logger.info(f"自动识别为Ollama模型: {request.model_name}")
                except Exception as e:
                    logger.warning(f"检查Ollama模型列表失败: {str(e)}")
        
        if use_ollama:
            ollama_proxy = get_ollama_proxy()
            if ollama_proxy is None:
                raise HTTPException(status_code=500, detail="Ollama代理未初始化")
            
            if request.model_name is None:
                raise HTTPException(status_code=400, detail="使用Ollama时必须指定模型名称")
            
            # 使用Ollama生成
            text = await ollama_proxy.generate(
                model=request.model_name,
                prompt=request.prompt,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                top_p=request.top_p
            )
            
            return GenerateResponse(
                text=text,
                model_name=request.model_name
            )
        else:
            model_manager = get_model_manager()
            
            # 使用本地模型生成
            text = model_manager.generate(
                prompt=request.prompt,
                model_name=request.model_name,
                max_new_tokens=request.max_tokens,
                temperature=request.temperature,
                top_p=request.top_p,
                top_k=request.top_k,
                repetition_penalty=request.repetition_penalty
            )
            
            return GenerateResponse(
                text=text,
                model_name=request.model_name or model_manager.current_model or "unknown"
            )
    except Exception as e:
        logger.error(f"生成文本失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"生成文本失败: {str(e)}")


@router.post("/generate/stream")
async def generate_stream(request: GenerateRequest):
    """流式文本生成（自动识别本地模型或Ollama模型）"""
    try:
        # 判断是否使用Ollama
        use_ollama = request.use_ollama
        
        # 如果指定了模型名称，检查是否为Ollama模型
        if request.model_name and not use_ollama:
            # 检查模型是否在Ollama列表中
            ollama_proxy = get_ollama_proxy()
            if ollama_proxy is not None:
                try:
                    ollama_models = await ollama_proxy.list_models()
                    ollama_model_names = [m.get("name") for m in ollama_models]
                    if request.model_name in ollama_model_names:
                        use_ollama = True
                        logger.info(f"自动识别为Ollama模型（流式）: {request.model_name}")
                except Exception as e:
                    logger.warning(f"检查Ollama模型列表失败: {str(e)}")
        
        if use_ollama:
            ollama_proxy = get_ollama_proxy()
            if ollama_proxy is None:
                raise HTTPException(status_code=500, detail="Ollama代理未初始化")
            
            if request.model_name is None:
                raise HTTPException(status_code=400, detail="使用Ollama时必须指定模型名称")
            
            # 使用Ollama流式生成
            async def ollama_stream():
                try:
                    result = await ollama_proxy.generate(
                        model=request.model_name,
                        prompt=request.prompt,
                        stream=True,
                        max_tokens=request.max_tokens,
                        temperature=request.temperature,
                        top_p=request.top_p
                    )
                    async for token in result:
                        yield f"data: {token}\n\n"
                except Exception as e:
                    yield f"data: [ERROR: {str(e)}]\n\n"
            
            return StreamingResponse(ollama_stream(), media_type="text/event-stream")
        else:
            model_manager = get_model_manager()
            
            # 使用本地模型流式生成
            def local_stream():
                for token in model_manager.generate_stream(
                    prompt=request.prompt,
                    model_name=request.model_name,
                    max_new_tokens=request.max_tokens,
                    temperature=request.temperature,
                    top_p=request.top_p
                ):
                    yield f"data: {token}\n\n"
            
            return StreamingResponse(local_stream(), media_type="text/event-stream")
    except Exception as e:
        logger.error(f"流式生成失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"流式生成失败: {str(e)}")


@router.post("/chat")
async def chat(request: ChatRequest):
    """对话接口（自动识别本地模型或Ollama模型）"""
    try:
        # 构建对话提示
        prompt = ""
        for msg in request.messages:
            if msg.role == "system":
                prompt += f"System: {msg.content}\n\n"
            elif msg.role == "user":
                prompt += f"User: {msg.content}\n\n"
            elif msg.role == "assistant":
                prompt += f"Assistant: {msg.content}\n\n"
        
        prompt += "Assistant: "
        
        # 判断是否使用Ollama
        use_ollama = request.use_ollama
        
        # 如果指定了模型名称，检查是否为Ollama模型
        if request.model_name and not use_ollama:
            # 检查模型是否在Ollama列表中
            ollama_proxy = get_ollama_proxy()
            if ollama_proxy is not None:
                try:
                    ollama_models = await ollama_proxy.list_models()
                    ollama_model_names = [m.get("name") for m in ollama_models]
                    if request.model_name in ollama_model_names:
                        use_ollama = True
                        logger.info(f"自动识别为Ollama模型（对话）: {request.model_name}")
                except Exception as e:
                    logger.warning(f"检查Ollama模型列表失败: {str(e)}")
        
        if use_ollama:
            ollama_proxy = get_ollama_proxy()
            if ollama_proxy is None:
                raise HTTPException(status_code=500, detail="Ollama代理未初始化")
            
            if request.model_name is None:
                raise HTTPException(status_code=400, detail="使用Ollama时必须指定模型名称")
            
            response = await ollama_proxy.generate(
                model=request.model_name,
                prompt=prompt,
                max_tokens=request.max_tokens,
                temperature=request.temperature
            )
        else:
            model_manager = get_model_manager()
            
            response = model_manager.generate(
                prompt=prompt,
                model_name=request.model_name,
                max_new_tokens=request.max_tokens,
                temperature=request.temperature
            )
        
        return {
            "response": response,
            "model_name": request.model_name or "unknown"
        }
    except Exception as e:
        logger.error(f"对话失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"对话失败: {str(e)}")


@router.post("/batch")
def batch_generate(request: BatchGenerateRequest):
    """批量生成"""
    try:
        model_manager = get_model_manager()
        
        results = []
        for prompt in request.prompts:
            try:
                text = model_manager.generate(
                    prompt=prompt,
                    model_name=request.model_name,
                    max_new_tokens=request.max_tokens,
                    temperature=request.temperature
                )
                results.append({
                    "prompt": prompt,
                    "text": text,
                    "status": "success"
                })
            except Exception as e:
                results.append({
                    "prompt": prompt,
                    "text": None,
                    "status": "error",
                    "error": str(e)
                })
        
        return {
            "results": results,
            "total": len(results),
            "success": sum(1 for r in results if r["status"] == "success")
        }
    except Exception as e:
        logger.error(f"批量生成失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"批量生成失败: {str(e)}")

