from typing import List

from api.core.postgres import get_db
from api.models.edge import Edge
from api.models.node import Node
from api.models.seed import Seed
from api.schemas.edge_schema import EdgeCreate
from api.schemas.node_schema import NodeCreate
from api.services.tgt_model import get_tgt_service
from api.services.gpt_service import get_gpt_service
from api.services.gnn_service import get_gnn_service
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session


class SeedService:
    def __init__(self, db: Session, seed_id: int):
        self.db = db
        self.seed = db.query(Seed).get(seed_id)
        if not self.seed:
            raise ValueError(f"Seed {seed_id} not found")
        self.tgt = get_tgt_service()
        self.gpt = get_gpt_service()
        self.gnn = get_gnn_service()

    def expand_seed(self, prompt: str) -> int:
        graph_json = self.tgt.text_to_graph(prompt)
        # 假设第一个节点是根节点
        root = graph_json["nodes"][0]
        node_data = NodeCreate(**root)
        node_model = Node(**node_data.model_dump(), seed_id=self.seed.id, parent_id=None)
        self.db.add(node_model)
        self.db.flush()  # 拿到 node_model.id
        # 插入所有边
        for ed in graph_json["edges"]:
            edge_data = EdgeCreate(**ed)
            edge_model = Edge(**edge_data.model_dump())
            self.db.add(edge_model)
        self.db.commit()
        return node_model.id

    def expand_node(self, node_id: int, prompt: str) -> List[int]:
        graph_json = self.tgt.text_to_graph(prompt)
        new_ids: List[int] = []
        for nd in graph_json["nodes"]:
            node_data = NodeCreate(**nd)
            nm = Node(**node_data.model_dump(),
                           seed_id=self.seed.id,
                           parent_id=node_id)
            self.db.add(nm)
            self.db.flush()
            new_ids.append(nm.id)
        for ed in graph_json["edges"]:
            edge_data = EdgeCreate(**ed)
            em = Edge(**edge_data.model_dump())
            self.db.add(em)
        self.db.commit()
        return new_ids


def get_seed_service(
    seed_id: int,
    db: Session = Depends(get_db),
) -> SeedService:
    try:
        return SeedService(db, seed_id)
    except ValueError:
        raise HTTPException(404, f"Seed {seed_id} not found")