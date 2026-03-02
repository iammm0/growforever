"""对比学习损失函数模块"""

import torch
import torch.nn.functional as F
from config.config import CONFIG


def nt_xent_loss(z_i, z_j, temperature: float | None = None) -> torch.Tensor:
    """计算 NT-Xent 对比损失。

    Args:
        z_i, z_j: 两组需要对比的向量表示。
        temperature: 温度系数，默认为配置文件中的设置。

    Returns:
        torch.Tensor: 标量损失值。
    """

    # 若未显式传入温度参数，则从配置读取
    if temperature is None:
        temperature = CONFIG["contrastive_loss"]["temperature"]

    # 基础合法性检查
    if z_i.shape[0] != z_j.shape[0] or z_i.shape[0] == 0:
        raise ValueError(f"[NT-Xent Loss] Invalid input: z_i.shape={z_i.shape}, z_j.shape={z_j.shape}")

    batch_size = z_i.shape[0]

    # L2 归一化向量
    z_i = F.normalize(z_i, dim=1)
    z_j = F.normalize(z_j, dim=1)

    # 计算余弦相似度矩阵
    similarity_matrix = torch.mm(z_i, z_j.T)  # shape: (batch_size, batch_size)

    # 真实标签：对角线位置应匹配
    targets = torch.arange(batch_size).to(z_i.device)

    # 温度缩放
    logits = similarity_matrix / temperature

    # 分别计算两方向的交叉熵损失
    loss_i = F.cross_entropy(logits, targets)
    loss_j = F.cross_entropy(logits.T, targets)

    # 前后向损失求平均
    loss = (loss_i + loss_j) / 2

    return loss
