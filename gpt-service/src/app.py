"""
FastAPI应用初始化模块

负责创建FastAPI应用实例、配置中间件、注册路由和生命周期管理。
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_config
from src.logger import setup_logger
from src.model_manager import ModelManager
from src.ollama_proxy import OllamaProxy
from src.trainer import LoRATrainer
from src.evaluator import ModelEvaluator
from src.dependencies import (
    set_model_manager, set_ollama_proxy,
    set_trainer, set_evaluator
)
from src.routes import api_router

logger = setup_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    config = get_config()
    logger.info("=" * 60)
    logger.info("GPT Service 启动中...")
    logger.info("=" * 60)
    
    try:
        # 初始化模型管理器
        model_manager = ModelManager(config)
        set_model_manager(model_manager)
        logger.info("模型管理器初始化完成")
        
        # 初始化Ollama代理
        ollama_proxy = OllamaProxy(config)
        await ollama_proxy.initialize()
        set_ollama_proxy(ollama_proxy)
        logger.info("Ollama代理初始化完成")
        
        # 初始化训练器
        trainer = LoRATrainer(config)
        set_trainer(trainer)
        logger.info("训练器初始化完成")
        
        # 初始化评估器
        evaluator = ModelEvaluator(model_manager, config)
        set_evaluator(evaluator)
        logger.info("评估器初始化完成")
        
        logger.info("=" * 60)
        logger.info("GPT Service 启动完成")
        logger.info("=" * 60)
        
        yield
        
    except Exception as e:
        logger.error(f"初始化失败: {str(e)}", exc_info=True)
        raise
    finally:
        # 关闭时清理
        ollama_proxy = None
        try:
            from src.dependencies import get_ollama_proxy
            ollama_proxy = get_ollama_proxy()
            if ollama_proxy:
                await ollama_proxy.close()
        except Exception as e:
            logger.warning(f"关闭Ollama代理时出错: {str(e)}")
        
        logger.info("GPT Service 关闭")


def create_app() -> FastAPI:
    """
    创建并配置FastAPI应用
    
    Returns:
        配置好的FastAPI应用实例
    """
    app = FastAPI(
        title="GPT Service",
        description="推理模型服务 - 支持本地模型训练和Ollama代理",
        version="1.0.0",
        lifespan=lifespan
    )
    
    # 配置CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 注册路由
    app.include_router(api_router)
    
    return app

