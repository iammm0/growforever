"""图结构编码器（GAT）"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GATConv
from torch_geometric.data import Data
from config.config import CONFIG


class GraphEncoder(nn.Module):
    """简单的两层 GAT 编码器"""

    def __init__(self, in_channels, hidden_channels=None, out_channels=None, heads=None):
        super(GraphEncoder, self).__init__()

        # 从配置读取默认参数
        hidden_channels = hidden_channels or CONFIG["graph_encoder"]["hidden_channels"]
        out_channels = out_channels or CONFIG["graph_encoder"]["out_channels"]
        heads = heads or CONFIG["graph_encoder"].get("heads", 2)

        self.conv1 = GATConv(in_channels, hidden_channels, heads=heads)
        self.conv2 = GATConv(hidden_channels * heads, out_channels, heads=1)

    def forward(self, x, edge_index):
        # 第一层注意力卷积
        x = self.conv1(x, edge_index)
        x = F.elu(x)
        # 第二层输出最终嵌入
        x = self.conv2(x, edge_index)
        return x


# 以下函数仅用于示例或测试
def build_sample_graph():
    """构造一个包含5个节点的简单无向图"""
    edge_index = torch.tensor([
        [0, 1, 1, 2, 2, 3, 3, 4],
        [1, 0, 2, 1, 3, 2, 4, 3]
    ], dtype=torch.long)
    x = torch.rand((5, 16))  # 5个节点，每个16维特征
    return Data(x=x, edge_index=edge_index)


def encode_graph(data: Data):
    """编码图结构并返回节点语义向量"""
    encoder = GraphEncoder(in_channels=data.x.shape[1])
    return encoder(data.x, data.edge_index)
