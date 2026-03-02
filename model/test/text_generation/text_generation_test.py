from text_generation.gpt_module_plus import build_generator_from_CONFIG

user_prompt = ("请描写一位在现代生活背景下，不断在雄心壮志与自我怀疑之间摇摆的年轻男性的心理状态。"
               "他今年22岁，热爱太空、科技与冒险，但时常陷入对自我价值的怀疑和未来方向的迷茫。"
               "请深入挖掘他的内心独白与情感波动，结合现实压力与理想之间的矛盾冲突，使文字具有哲理性与现实感。")

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

CONFIG = {
    "gpt": {
        "model_name": "Qwen/Qwen2-7B-Instruct",
        "max_new_tokens": 1200,
        "temperature": 0.7,
        "top_p": 0.9,
        "repetition_penalty": 1.08,
        "device_map": "auto",
        "torch_dtype": "float16",
        "quantization": None,
        "trust_remote_code": True,
        "stop_words": ["提纲：", "总结：", "正文：", "对话：", "参考文献：", "分析：", "结论："],
        "stream": False,
    }
}

generator = build_generator_from_CONFIG(CONFIG)

text = generator.generate_psych_monologue(user_prompt, user_profile, target_tokens=900)
print(text)