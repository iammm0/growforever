"""实体与关系抽取模块"""

import spacy
from langdetect import detect

# 延迟加载的 spaCy 模型缓存
_spacy_models = {}


def get_nlp(text: str):
    """根据文本语言动态加载对应的 spaCy 模型"""
    lang = detect(text)
    if lang.startswith("zh"):
        model_name = "zh_core_web_sm"
    else:
        model_name = "en_core_web_sm"

    if model_name not in _spacy_models:
        _spacy_models[model_name] = spacy.load(model_name)

    return _spacy_models[model_name]


def extract_entities_and_relations(text: str) -> dict:
    """使用传统 NLP 抽取实体及共现关系"""

    nlp = get_nlp(text)
    doc = nlp(text)
    nodes = []
    edges = []

    for ent_id, ent in enumerate(doc.ents):
        nodes.append({
            "id": str(ent_id),
            "label": ent.text,
            "type": ent.label_,
        })

    for i in range(len(nodes)):
        for j in range(i + 1, len(nodes)):
            edges.append(
                {
                    "from": nodes[i]["id"],
                    "to": nodes[j]["id"],
                    "label": "共现",
                }
            )

    return {"nodes": nodes, "edges": edges}
