def parse_text_to_graph(text: str) -> dict:
    """
    将生成的长文本拆分成句子，并构造一个简单的图结构。

    每个句子作为一个节点，前后句之间建立 "follows" 关系。

    Args:
        text (str): GPT 生成的长文本

    Returns:
        dict: 包含 nodes 与 edges 的图结构数据
    """
    # 根据句号分句，并过滤空句子
    sentences = [s.strip() for s in text.split('.') if s.strip()]

    nodes = []
    edges = []

    for idx, sentence in enumerate(sentences):
        nodes.append({
            "id": idx + 1,
            "label": sentence,
            "type": "generated"
        })
        if idx > 0:
            edges.append({
                "from": idx,
                "to": idx + 1,
                "label": "follows"
            })
    return {"nodes": nodes, "edges": edges}