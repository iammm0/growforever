"""根据节点和边描述构建有向图"""

import networkx as nx


def build_graph(nodes, edges):
    """构建并返回一个 NetworkX 有向图"""

    G = nx.DiGraph()

    # 添加节点及其属性
    for node in nodes:
        G.add_node(node["id"], **node)

    # 添加边及其关系标签
    for edge in edges:
        G.add_edge(edge["from"], edge["to"], label=edge["label"])

    return G