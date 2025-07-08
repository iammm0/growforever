import neo4j
from .config import settings

class Neo4jSession:
    def __init__(self):
        self._driver = neo4j.GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )

    def close(self):
        self._driver.close()

    def get_session(self):
        return self._driver.session()

neo4j_db = Neo4jSession()

# Dependency，用于FastAPI依赖注入
def get_neo4j():
    session = neo4j_db.get_session()
    try:
        yield session
    finally:
        session.close()
