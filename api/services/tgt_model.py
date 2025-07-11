import json

from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

class Text2Graph2Text:
    def __init__(self, model_name_or_path: str):
        # 加载 tokenizer 和模型
        self.tokenizer = AutoTokenizer.from_pretrained(model_name_or_path)
        self.model     = AutoModelForSeq2SeqLM.from_pretrained(model_name_or_path).to("cuda")

    def text_to_graph(self, prompt: str) -> dict:
        """调用模型生成图结构的中间 JSON 表示"""
        inputs = self.tokenizer(prompt, return_tensors="pt").to("cuda")
        outs   = self.model.generate(**inputs, max_length=512)
        raw    = self.tokenizer.batch_decode(outs, skip_special_tokens=True)[0]
        # 假设模型输出的是 JSON 字符串
        return json.loads(raw)

    def graph_to_text(self, graph_json: dict) -> str:
        """调用模型反哺文本"""
        payload = json.dumps(graph_json)
        inputs  = self.tokenizer(payload, return_tensors="pt").to("cuda")
        outs    = self.model.generate(**inputs, max_length=256)
        return self.tokenizer.batch_decode(outs, skip_special_tokens=True)[0]

# 创建单例
tgt_service: Text2Graph2Text | None = None

# 在 lifespan 中调用一次 get_tgt_service()，模型就会被加载到 GPU
def get_tgt_service() -> Text2Graph2Text:
    global tgt_service
    if tgt_service is None:
        tgt_service = Text2Graph2Text("iammm0/text2graph2text")
    return tgt_service