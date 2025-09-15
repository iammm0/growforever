"""Neo4j 图数据库连接管理与 FastAPI 依赖注入。"""

import neo4j
from .config import settings


class Neo4jSession:
    """包装 Neo4j 驱动，实现单例式的连接管理。"""

    def __init__(self):
        # 初始化 Driver，使用配置文件中的连接信息
        self._driver = neo4j.GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )

    def close(self):
        """关闭底层 Driver，释放连接资源。"""
        self._driver.close()

    def get_session(self):
        """获取一个新的 Session，用于执行 Cypher 语句。"""
        return self._driver.session()


# 全局单例，供应用共享
neo4j_db = Neo4jSession()


def get_neo4j():
    """FastAPI 依赖项，提供 Neo4j Session 并在请求结束后关闭。"""
    session = neo4j_db.get_session()
    try:
        yield session
    finally:
        session.close()
