"""
模型管理路由
"""

from fastapi import APIRouter, HTTPException
from src.dependencies import get_model_manager, get_ollama_proxy
from src.schemas import LoadModelRequest
from src.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.get("/models")
async def list_models():
    """获取模型列表（包含本地模型和Ollama模型）"""
    try:
        all_models = []
        local_models = []
        ollama_models = []
        
        # 获取本地模型列表
        model_manager = get_model_manager()
        local_models = model_manager.list_models()
        all_models.extend(local_models)
        
        # 获取Ollama模型列表
        ollama_proxy = get_ollama_proxy()
        if ollama_proxy is not None:
            try:
                ollama_list = await ollama_proxy.list_models()
                # 将Ollama模型转换为统一格式
                for model in ollama_list:
                    ollama_model = {
                        "name": model.get("name"),
                        "type": "ollama",
                        "device": "ollama",
                        "is_current": False,
                        "size": model.get("size"),
                        "modified_at": model.get("modified_at")
                    }
                    ollama_models.append(ollama_model)
                    all_models.append(ollama_model)
            except Exception as e:
                logger.warning(f"获取Ollama模型列表失败: {str(e)}")
                # Ollama获取失败不影响整体返回，只记录警告
        
        # 确定当前模型
        current_model = None
        if model_manager.current_model:
            current_model = model_manager.current_model
        
        return {
            "models": all_models,
            "current_model": current_model,
            "total_count": len(all_models),
            "local_count": len(local_models),
            "ollama_count": len(ollama_models)
        }
    except Exception as e:
        logger.error(f"获取模型列表失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取模型列表失败: {str(e)}")


@router.get("/models/{model_name}")
def get_model_info(model_name: str):
    """获取模型详情"""
    try:
        model_manager = get_model_manager()
        
        model_info = model_manager.get_model(model_name)
        if model_info is None:
            raise HTTPException(status_code=404, detail=f"模型 {model_name} 不存在")
        
        return {
            "name": model_info.name,
            "type": model_info.model_type.value,
            "device": model_info.device,
            "lora_adapter": model_info.lora_adapter,
            "is_current": model_name == model_manager.current_model
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取模型信息失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取模型信息失败: {str(e)}")


@router.post("/models/load")
def load_model(request: LoadModelRequest):
    """加载模型"""
    try:
        model_manager = get_model_manager()
        
        model_info = model_manager.load_model(
            model_name=request.model_name,
            model_path=request.model_path,
            lora_adapter=request.lora_adapter
        )
        
        return {
            "status": "success",
            "message": f"模型 {request.model_name} 加载成功",
            "model_name": model_info.name,
            "type": model_info.model_type.value
        }
    except Exception as e:
        logger.error(f"加载模型失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"加载模型失败: {str(e)}")


@router.post("/models/unload")
def unload_model(model_name: str):
    """卸载模型"""
    try:
        model_manager = get_model_manager()
        
        success = model_manager.unload_model(model_name)
        if not success:
            raise HTTPException(status_code=404, detail=f"模型 {model_name} 未找到")
        
        return {
            "status": "success",
            "message": f"模型 {model_name} 已卸载"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"卸载模型失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"卸载模型失败: {str(e)}")


@router.post("/models/switch")
def switch_model(model_name: str):
    """切换模型"""
    try:
        model_manager = get_model_manager()
        
        success = model_manager.switch_model(model_name)
        if not success:
            raise HTTPException(status_code=404, detail=f"模型 {model_name} 未找到")
        
        return {
            "status": "success",
            "message": f"已切换到模型: {model_name}",
            "current_model": model_name
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"切换模型失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"切换模型失败: {str(e)}")

