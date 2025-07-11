from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from api.core.config import settings
from api.services.gpt_service import (
    get_gpt_service,
    GPTService,
    SERVICE_TYPES as GPT_TYPES,
)
from api.services.gnn_service import (
    get_gnn_service,
    GNNService,
    SERVICE_TYPES as GNN_TYPES,
)

router = APIRouter(prefix="/services", tags=["services"])


class ServiceTypeResponse(BaseModel):
    service_type: str = Field(..., description="当前使用的服务类型")
    available: List[str] = Field(..., description="可选的服务类型列表")


class ServiceTypeRequest(BaseModel):
    service_type: str = Field(..., description="要切换到的服务类型")


# —— GPT 服务切换 —— #
@router.get(
    "/gpt",
    response_model=ServiceTypeResponse,
    summary="查看或切换 GPT 服务类型",
)
def get_current_gpt() -> ServiceTypeResponse:
    """
    返回当前 GPTService 类型，以及所有可选类型。
    """
    return ServiceTypeResponse(
        service_type=settings.GPT_SERVICE_TYPE,
        available=GPT_TYPES,
    )


@router.post(
    "/gpt",
    response_model=ServiceTypeResponse,
    summary="切换 GPT 服务类型",
)
def set_gpt_type(req: ServiceTypeRequest) -> ServiceTypeResponse:
    """
    在运行时切换 GPTService 实现：
    - default: 内置 text2graph2text graph2text
    - hf     : HF transformers pipeline
    - openai : OpenAI API
    - remote : 自定义外部 HTTP 服务
    """
    t = req.service_type.lower()
    if t not in GPT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"未知 GPT 服务类型：{t}，可选：{GPT_TYPES}",
        )
    settings.GPT_SERVICE_TYPE = t
    # 立刻验证能否实例化
    svc: GPTService = get_gpt_service()
    return ServiceTypeResponse(service_type=t, available=GPT_TYPES)


# —— GNN 服务切换 —— #
@router.get(
    "/gnn",
    response_model=ServiceTypeResponse,
    summary="查看或切换 GNN 服务类型",
)
def get_current_gnn() -> ServiceTypeResponse:
    """
    返回当前 GNNService 类型，以及所有可选类型。
    """
    return ServiceTypeResponse(
        service_type=settings.GNN_SERVICE_TYPE,
        available=GNN_TYPES,
    )


@router.post(
    "/gnn",
    response_model=ServiceTypeResponse,
    summary="切换 GNN 服务类型",
)
def set_gnn_type(req: ServiceTypeRequest) -> ServiceTypeResponse:
    """
    在运行时切换 GNNService 实现：
    - default: 内置 Graph Transformer 本地编码器
    - remote : 自定义外部 HTTP 服务
    """
    t = req.service_type.lower()
    if t not in GNN_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"未知 GNN 服务类型：{t}，可选：{GNN_TYPES}",
        )
    settings.GNN_SERVICE_TYPE = t
    # 立刻验证能否实例化
    svc: GNNService = get_gnn_service()
    return ServiceTypeResponse(service_type=t, available=GNN_TYPES)
