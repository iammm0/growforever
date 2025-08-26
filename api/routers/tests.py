from fastapi import APIRouter, Depends
from qdrant_client import QdrantClient
from sqlalchemy.orm import Session
from sqlalchemy import text

from api.core.postgres_connection import get_db
from api.core.neo4j_connection import get_neo4j, Neo4jSession
from api.core.qdrant_connection import get_qdrant

router = APIRouter(prefix="/test", tags=["Health Check"])

@router.get("/postgres", summary="检查 postgresql 是否正常连接")
def postgres_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "PostgreSQL Connected"}
    except Exception as e:
        return {"status": "Error", "detail": str(e)}

@router.get("/neo4j", summary="检查 Neo4j 是否正常连接")
def neo4j_check(session: Neo4jSession = Depends(get_neo4j)):
    """
    session 类型是 neo4j.Session（alias 为 Neo4jSessionType），
    而不是自定义的 Neo4jSession 类。
    """
    try:
        result = session.run("RETURN 1 AS result")
        value = result.single()["result"]
        return {"status": "Neo4j Connected", "value": value}
    except Exception as e:
        return {"status": "Error", "detail": str(e)}


@router.get("/qdrant", summary="检查 Qdrant 连接状态")
def qdrant_check(client: QdrantClient = Depends(get_qdrant)):
    try:
        # 通过 HTTP 客户端的 service_api 调用 healthz()
        status = client.http.service_api.healthz()
        return {"status": "Qdrant Connected", "healthz": status}
    except Exception as e:
        return {"status": "Error", "detail": str(e)}