from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from core.database import get_db
from core.neo4jConfig import get_neo4j
from neo4j import Session as NeoSession

router = APIRouter(prefix="/test", tags=["Health Check"])

@router.get("/postgres", summary="检查 postgresql 是否正常连接")
def postgres_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "PostgreSQL Connected"}
    except Exception as e:
        return {"status": "Error", "detail": str(e)}

@router.get("/neo4j", summary="检查 neo4j 是否正常连接")
def neo4j_check(session: NeoSession = Depends(get_neo4j)):
    try:
        result = session.run("RETURN 1 AS result")
        value = result.single()["result"]
        return {"status": "Neo4j Connected", "value": value}
    except Exception as e:
        return {"status": "Error", "detail": str(e)}
