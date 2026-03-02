"""对比学习训练循环"""

from src.contrastive_loss import nt_xent_loss


def train_contrastive_epoch(model, dataloader, optimizer, device="cpu"):
    """单个 epoch 的对比学习训练"""

    model.train()
    total_loss = 0

    for batch in dataloader:
        batch = batch.to(device)
        z = model(batch.x, batch.edge_index)

        # 模拟正样本对（划分前后一半）
        mid = z.shape[0] // 2
        z1 = z[:mid]
        z2 = z[mid:mid + z1.shape[0]]

        loss = nt_xent_loss(z1, z2)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    return total_loss / len(dataloader)
