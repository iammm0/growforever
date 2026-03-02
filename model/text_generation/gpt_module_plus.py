# gpt_module_psych.py
from dataclasses import dataclass
from typing import Dict, List, Optional, Union
import json
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TextIteratorStreamer,
    GenerationConfig,
)


@dataclass
class GPTConfig:
    model_name: str = "Qwen/Qwen2-7B-Instruct"  # 示例：中文友好模型
    max_new_tokens: int = 2048                  # 注意别超过模型上下文上限
    temperature: float = 0.8
    top_p: float = 0.9
    top_k: Optional[int] = None
    repetition_penalty: float = 1.05
    do_sample: bool = True
    # 性能与显存
    device_map: Union[str, Dict] = "auto"
    torch_dtype: Optional[str] = "float16"      # 可设为 "float16"/"bfloat16"/None
    quantization: Optional[str] = None          # "4bit"|"8bit"|None（需 bitsandbytes）
    trust_remote_code: bool = True              # 对 Qwen 等模型必要
    # 生成细节
    eos_token_ids: Optional[List[int]] = None   # 额外停用 token（可留空）
    stop_words: Optional[List[str]] = None      # 纯文本级停用串
    # 流式输出
    stream: bool = False


class GPTGenerator:
    def __init__(self, cfg: GPTConfig):
        self.cfg = cfg
        self.tokenizer = AutoTokenizer.from_pretrained(
            cfg.model_name,
            trust_remote_code=cfg.trust_remote_code,
            use_fast=True,
        )

        load_kwargs = {
            "trust_remote_code": cfg.trust_remote_code,
            "device_map": cfg.device_map,
        }
        if cfg.quantization == "4bit":
            load_kwargs.update(dict(load_in_4bit=True))
        elif cfg.quantization == "8bit":
            load_kwargs.update(dict(load_in_8bit=True))
        else:
            if cfg.torch_dtype in {"bfloat16", "float16"}:
                load_kwargs["torch_dtype"] = getattr(torch, cfg.torch_dtype)

        self.model = AutoModelForCausalLM.from_pretrained(cfg.model_name, **load_kwargs)

        # pad/eos 修正（许多模型无 pad_token）
        if self.tokenizer.pad_token_id is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        # 预设生成配置
        self.gen_config = GenerationConfig(
            max_new_tokens=cfg.max_new_tokens,
            temperature=cfg.temperature,
            top_p=cfg.top_p,
            do_sample=cfg.do_sample,
            repetition_penalty=cfg.repetition_penalty,
        )
        if cfg.top_k is not None:
            self.gen_config.top_k = cfg.top_k
        if cfg.eos_token_ids:
            self.gen_config.eos_token_id = cfg.eos_token_ids

    # ---------- 工具：是否适合使用 chat_template ----------
    def _supports_chat_template(self) -> bool:
        """
        简单基于模型名判断是否适合 chat 模板。
        若为 GPT-2/纯因果 LM（无模板），返回 False。
        """
        mid = (self.tokenizer.name_or_path or "").lower()
        hits_yes = ["qwen", "yi", "llama", "instruct", "chat", "internlm2", "glm", "mistral-instruct"]
        hits_no = ["gpt2", "clm", "cdial-gpt2", "uer/gpt2", "wenzhong-gpt2"]
        if any(x in mid for x in hits_no):
            return False
        return any(x in mid for x in hits_yes)

    # ---------- Prompt 构造（仅内心独白） ----------
    def build_inputs(self, prompt: str, user_profile: Dict) -> Dict[str, torch.Tensor]:
        """
        1) 能用 chat 模板：用 system 约束 “只输出第一人称内心独白”
        2) 否则回退到严格的中文独白模板
        """
        # 强约束：只输出心理活动
        system_rule = (
            "只用中文、只输出第一人称的内心独白；"
            "不要出现对话、引号、角色名、旁白、场景或动作描写；"
            "不要推进情节、不要列提纲、不要小标题；"
            "不要解释你的写作过程，也不要输出“分析/总结/提纲/正文”等字样；"
            "语言可有隐喻与意象，但保持清晰与真实感。"
        )

        if self._supports_chat_template():
            messages = [
                {"role": "system", "content": system_rule},
                {"role": "user", "content": self._cn_prompt(prompt, user_profile)},
            ]
            try:
                text = self.tokenizer.apply_chat_template(
                    messages, tokenize=False, add_generation_prompt=True
                )
                toks = self.tokenizer(text, return_tensors="pt")
                return {k: v.to(self.model.device) for k, v in toks.items()}
            except Exception:
                pass  # 回退到纯文本模板

        # ——回退模板：同样严格限定为“只有内心独白”——
        fallback = (
            "【任务】仅用中文输出第一人称的内心独白。\n"
            "【禁止】对话、引号、角色名、场景/动作描写、情节推进、提纲、小标题、分析/总结提示词。\n"
            "【人物画像】\n"
            f"{json.dumps(user_profile, ensure_ascii=False, indent=2)}\n"
            "【主题】\n"
            f"{prompt}\n"
            "【开始内心独白】"
        )
        toks = self.tokenizer(fallback, return_tensors="pt")
        return {k: v.to(self.model.device) for k, v in toks.items()}

    @staticmethod
    def _cn_prompt(prompt: str, user_profile: Dict) -> str:
        # 更心理导向的中文提示
        return (
            "围绕下述人物与主题，产出连续、流动的第一人称内心独白，"
            "聚焦情绪波动、价值冲突、自我辩论与自我安抚：\n"
            f"人物画像：{json.dumps(user_profile, ensure_ascii=False)}\n"
            f"主题：{prompt}\n"
            "避免任何客观叙述与外部细节，只呈现心理活动与感受层次。"
        )

    # ---------- 基础生成 ----------
    def generate_text(
        self,
        prompt: str,
        user_profile: Dict,
        extra_config: Optional[Dict] = None,
    ) -> str:
        inputs = self.build_inputs(prompt, user_profile)
        gen_cfg = self._merge_gen_config(extra_config)

        # 纯文本停用词（软性约束：避免出现“提纲/总结/正文/对话”等词）
        # 注意：这只是文本层面，不是 LogitsProcessor 强停。
        if self.cfg.stream:
            streamer = TextIteratorStreamer(
                self.tokenizer, skip_prompt=True, skip_special_tokens=True
            )
            _ = self.model.generate(
                **inputs,
                generation_config=gen_cfg,
                streamer=streamer,
                pad_token_id=self.tokenizer.pad_token_id,
            )
            chunks = []
            for token in streamer:
                chunks.append(token)
            text = "".join(chunks)
        else:
            outputs = self.model.generate(
                **inputs,
                generation_config=gen_cfg,
                pad_token_id=self.tokenizer.pad_token_id,
            )
            text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        if self.cfg.stop_words:
            for sw in self.cfg.stop_words:
                text = text.replace(sw, "")
        return text

    # ---------- 专用：心理独白模式（更稳） ----------
    def generate_psych_monologue(
        self,
        prompt: str,
        user_profile: Dict,
        target_tokens: int = 800,
    ) -> str:
        """
        进一步收紧采样，减少模板化词汇与跑题风险。
        """
        extra = {
            "max_new_tokens": target_tokens,
            "temperature": min(self.cfg.temperature, 0.85),
            "top_p": max(self.cfg.top_p, 0.9),
            "repetition_penalty": max(self.cfg.repetition_penalty, 1.08),
            "top_k": None,  # 防止极小词表 top_k 偏态/越界
        }
        return self.generate_text(prompt, user_profile, extra_config=extra)

    # ---------- 长文本两阶段（保留；如只要独白可不用） ----------
    def generate_longform(
        self,
        prompt: str,
        user_profile: Dict,
        outline_sections: int = 6,
        section_tokens: int = 512,
    ) -> str:
        """
        若仍想两阶段写法，可保留；但考虑你要“只心理独白”，
        推荐直接用 generate_psych_monologue。
        """
        # 1) 生成“提纲”（注意，你当前需求可能不需要提纲）
        outline_prompt = (
            f"{prompt}\n\n请先输出一个简短提纲（约 {outline_sections} 节），"
            "随后不要展开正文。仅用于内部规划。"
        )
        outline_text = self.generate_text(outline_prompt, user_profile)

        # 2) 逐节扩写为独白（尽量不出现外叙）
        sections = self._extract_sections(outline_text, max_n=outline_sections)
        final_parts = [outline_text, "\n\n【正文（心理独白）】\n"]
        for i, sec in enumerate(sections, 1):
            section_prompt = (
                f"围绕提纲第 {i} 节进行第一人称心理独白写作（约 {section_tokens} tokens）：\n"
                f"提纲：{sec}\n"
                "要求：仅呈现心理活动；避免叙事、对话、提纲、小标题与外部细节。"
            )
            part = self.generate_psych_monologue(section_prompt, user_profile, target_tokens=section_tokens)
            final_parts.append(f"\n【第 {i} 节】{sec}\n{part}\n")
        return "\n".join(final_parts)

    # ---------- 小工具 ----------
    def _merge_gen_config(self, extra: Optional[Dict]) -> GenerationConfig:
        if not extra:
            return self.gen_config
        merged = self.gen_config.to_dict()
        merged.update(extra)
        return GenerationConfig(**merged)

    @staticmethod
    def _extract_sections(outline_text: str, max_n: int = 6) -> List[str]:
        lines = [l.strip() for l in outline_text.splitlines()]
        sections = []
        for l in lines:
            if not l:
                continue
            if l[0].isdigit() and "." in l[:4]:
                sec = l.split(".", 1)[1].strip()
                if sec:
                    sections.append(sec)
        if not sections:
            sections = [l for l in lines if l][:max_n]
        return sections[:max_n]


# ======== 便捷入口：与你的 CONFIG 结合 ========
def build_generator_from_CONFIG(CONFIG) -> GPTGenerator:
    cfg = GPTConfig(
        model_name=CONFIG["gpt"]["model_name"],
        max_new_tokens=CONFIG["gpt"].get("max_new_tokens", 1024),
        temperature=CONFIG["gpt"].get("temperature", 0.8),
        top_p=CONFIG["gpt"].get("top_p", 0.9),
        top_k=CONFIG["gpt"].get("top_k", None),
        repetition_penalty=CONFIG["gpt"].get("repetition_penalty", 1.05),
        device_map=CONFIG["gpt"].get("device_map", "auto"),
        torch_dtype=CONFIG["gpt"].get("torch_dtype", "float16"),
        quantization=CONFIG["gpt"].get("quantization", None),
        trust_remote_code=CONFIG["gpt"].get("trust_remote_code", True),
        eos_token_ids=CONFIG["gpt"].get("eos_token_ids", None),
        stop_words=CONFIG["gpt"].get("stop_words", None),
        stream=CONFIG["gpt"].get("stream", False),
    )
    return GPTGenerator(cfg)
