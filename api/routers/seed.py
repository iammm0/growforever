from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.postgres import get_db
from models.seed import Seed
from schemas.seed_schema import SeedResponse, SeedCreate, ExpandResponse, ExpandRequest
from services.seed_service import SeedService

router = APIRouter(
    prefix="/seeds",
    tags=["seeds"],
    responses={404: {"description": "Not found"}},
)

@router.post("", response_model=SeedResponse, summary="创建一个新种子")
def create_seed(
    data: SeedCreate,
    db: Session = Depends(get_db),
):
    # 直接用 ORM 创建 Seed
    seed = Seed(**data.model_dump())
    db.add(seed)
    db.commit()
    db.refresh(seed)
    return seed

def get_seed_service(
    seed_id: int,
    db: Session = Depends(get_db),
) -> SeedService:
    # SeedService 构造时会做 seed 存在性校验
    try:
        return SeedService(db, seed_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Seed not found")

@router.post(
    "/{seed_id}/expand",
    response_model=ExpandResponse,
    summary="对空白种子做第一次膨胀，返回根节点 ID",
)
def expand_seed(
    seed_id: int,
    req: ExpandRequest,
    svc: SeedService = Depends(get_seed_service),
):
    try:
        root_id = svc.expand_seed(req.prompt)
        return ExpandResponse(new_node_ids=[root_id])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/{seed_id}/nodes/{node_id}/expand",
    response_model=ExpandResponse,
    summary="对指定节点做膨胀，返回新生成节点的 ID 列表",
)
def expand_node(
    seed_id: int,
    node_id: int,
    req: ExpandRequest,
    svc: SeedService = Depends(get_seed_service),
):
    try:
        new_ids = svc.expand_node(node_id, req.prompt)
        return ExpandResponse(new_node_ids=new_ids)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))