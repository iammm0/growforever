"""NeuroWeave 主流程脚本"""

import torch
from torch_geometric.data import Data, DataLoader

from src.contrastive_loss import nt_xent_loss
from text_generation.gpt_module import generate_text
from src.graph_builder import build_graph
from src.graph_embedding_visualizer import visualize_embeddings
from src.graph_to_text import graph_to_text
from src.graph_transformer import GraphEncoder
from src.graph_visualizer import visualize_graph
from src.ner_extraction import extract_entities_and_relations
from src.train_contrastive import train_contrastive_epoch
from config.config import CONFIG


def main():
    """执行完整的文本→图→文本流程"""
    print("tgt系统启动!!!")

    # ========== Step 1: 用户输入 ==========
    user_prompt = "请描写一位在现代生活背景下，不断在雄心壮志与自我怀疑之间摇摆的年轻男性的心理状态。他今年22岁，热爱太空、科技与冒险，但时常陷入对自我价值的怀疑和未来方向的迷茫。请深入挖掘他的内心独白与情感波动，结合现实压力与理想之间的矛盾冲突，使文字具有哲理性与现实感。"
    user_profile = {
        "年龄": 22,
        "性别": "男",
        "教育背景": "航天工程专业本科生",
        "职业": "太空科技初创公司的实习生",
        "性格特点": ["好奇心强", "理想主义", "自我反思", "内向", "情感敏感"],
        "兴趣爱好": [
            "太空探索",
            "前沿科技",
            "科幻文学",
            "户外冒险（如徒步、攀岩）",
            "哲学与存在主义问题"
        ],
        "动机与目标": [
            "希望为人类的太空未来做出贡献",
            "梦想参与火星探测或建设任务",
            "渴望通过科学与创新找到自我价值和意义"
        ],
        "面临的挑战": [
            "经常怀疑自己的能力与价值",
            "在高度竞争的环境中感到压力巨大",
            "难以在雄心壮志与情绪健康之间找到平衡",
            "因兴趣小众而感到孤独"
        ],
        "心理模式": {
            "雄心": "有强烈的未来愿景，设定高目标，深受马斯克和卡尔·萨根等人物影响",
            "自我怀疑": "常有“冒名顶替者”心态，怀疑自己是否真的有能力",
            "应对方式": [
                "写日记记录思考",
                "通过阅读科幻小说或仰望星空来逃避现实",
                "在压力大时有时会拖延"
            ]
        }
    }

    # ========== Step 2: 文本生成 ==========
    print("\n🧠 Step 1: 文本生成")
    long_text = generate_text(user_prompt, user_profile)
    print("📄 生成文本:\n", long_text)

    # ========== Step 3: 实体与关系抽取 ==========
    print("\n🔍 Step 2: 实体识别与关系抽取")
    graph_data = extract_entities_and_relations(long_text)
    print("🧩 图结构数据:", graph_data)

    # ========== Step 4: 构建图 ==========
    print("\n🕸 Step 3: 构建图")
    graph = build_graph(graph_data["nodes"], graph_data["edges"])
    print(f"✅ 成功构建图：{graph.number_of_nodes()} 个节点, {graph.number_of_edges()} 条边")
    visualize_graph(graph, output_file="graph_output.html")

    # ========== Step 5: 图结构编码 ==========
    print("\n🔬 Step 4: 图结构编码")
    node_id_map = {node_id: idx for idx, node_id in enumerate(graph.nodes)}
    num_nodes = len(node_id_map)
    x = torch.eye(num_nodes)

    edge_index = torch.tensor([
        [node_id_map[src] for src, tgt in graph.edges],
        [node_id_map[tgt] for src, tgt in graph.edges]
    ], dtype=torch.long)

    data = Data(x=x, edge_index=edge_index)

    # 根据配置构建图编码器
    model = GraphEncoder(
        in_channels=num_nodes,
        hidden_channels=CONFIG["graph_encoder"]["hidden_channels"],
        out_channels=CONFIG["graph_encoder"]["out_channels"],
        heads=CONFIG["graph_encoder"].get("heads", 2),
    )
    embeddings = model(data.x, data.edge_index)
    print("🧠 得到节点语义嵌入，shape:", embeddings.shape)

    if embeddings.shape[0] >= 2:
        visualize_embeddings(embeddings, labels=[graph.nodes[n]["label"] for n in graph.nodes])
    else:
        print("⚠️ 可视化跳过：节点数不足")

    # ========== Step 6: 对比学习 ==========
    print("\n🎯 Step 5: 对比学习")
    mid = embeddings.shape[0] // 2
    if mid > 0:
        z1, z2 = embeddings[:mid], embeddings[mid:mid*2]
        loss = nt_xent_loss(z1, z2)
        print("🧠 对比学习 NT-Xent Loss:", loss.item())
    else:
        print("⚠️ 节点太少，跳过对比损失")

    # ========== Step 7: 图转文本探索 ==========
    print("\n📝 Step 6: 图转文本探索")
    try:
        text_prompt = graph_to_text(graph, embeddings, target_node_id="0")
        print("📜 生成的新探索提示：", text_prompt)
    except Exception as e:
        print("⚠️ 图转文本失败：", e)

    # ========== Step 8: 图嵌入训练 ==========
    print("\n🚀 Step 7: 图嵌入对比训练")
    if num_nodes >= 2:
        loader = DataLoader([data, data], batch_size=2)

        # 根据配置设置学习率与训练轮数
        optimizer = torch.optim.Adam(model.parameters(), lr=CONFIG["training"]["lr"])

        for epoch in range(CONFIG["training"]["epochs"]):
            epoch_loss = train_contrastive_epoch(model, loader, optimizer)
            print(f"Epoch {epoch + 1}: contrastive loss = {epoch_loss:.4f}")
    else:
        print("⚠️ 节点过少，跳过训练流程")

    print("\n✅ 所有流程完成，tgt 完成一次循环")

if __name__ == "__main__":
    main()