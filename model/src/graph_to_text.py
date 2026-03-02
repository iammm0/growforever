"""图结构转文本模块"""


def graph_to_text(graph, embeddings, target_node_id=None):
    """将图中某节点及其邻居关系转化为可读文本"""

    # 若图为空直接返回提示
    if graph.number_of_nodes() == 0:
        return "⚠️ 当前图为空，暂无可探索内容。"

    # 自动选择一个有效的目标节点
    if target_node_id is None or target_node_id not in graph.nodes:
        target_node_id = list(graph.nodes)[0]

    # 尝试获取目标节点标签
    target = graph.nodes[target_node_id].get("label", "未知节点")
    neighbor_text = []

    # 汇总邻居及关系信息
    for neighbor in graph.neighbors(target_node_id):
        neighbor_label = graph.nodes[neighbor].get("label", "未知节点")
        edge_data = graph.get_edge_data(target_node_id, neighbor)
        edge_label = edge_data.get("label", "关联") if edge_data else "关联"
        neighbor_text.append(f"与之{edge_label}的有：{neighbor_label}")

    context = f"当前探索节点：{target}。\n" + "\n".join(neighbor_text)
    return context
