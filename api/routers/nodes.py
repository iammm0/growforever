from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from core.database import get_db
from models import Node
from schemas.node_schema import NodeCreate, NodeResponse, NodeUpdate

router = APIRouter(prefix="/nodes", tags=["Nodes"])

@router.post("/", response_model=NodeResponse ,summary="创建节点")
def create_node(node: NodeCreate, db: Session = Depends(get_db)):
    db_node = Node(**node.model_dump(exclude_unset=True))
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

@router.get("/{node_id}", response_model=NodeResponse, summary="获取特定节点详情内容")
def read_node(node_id: int, db: Session = Depends(get_db)):
    stmt = select(Node).where(Node.id == node_id)  # type: ignore
    db_node = db.execute(stmt).scalar_one_or_none()
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")
    return db_node

@router.patch("/{node_id}", response_model=NodeResponse, summary="修改特定节点的状态")
def update_node(node_id: int, node: NodeUpdate, db: Session = Depends(get_db)):
    db_node = db.query(Node).filter(Node.id == node_id).first()  # type: ignore
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")

    for key, value in node.model_dump(exclude_unset=True).items():
        setattr(db_node, key, value)

    db.commit()
    db.refresh(db_node)
    return db_node
