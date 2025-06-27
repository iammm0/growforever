from transformers import pipeline

# 初始化文本生成流水线，可以调整模型名称与生成参数
gpt_generator = pipeline("text-generation", model="gpt2")

def generate_text(prompt: str, max_length: int = 200) -> str:
    """
    根据输入提示生成扩展文本。

    Args:
        prompt (str): 用户输入的提示文本
        max_length (int, optional): 生成文本的最长长度，默认为200

    Returns:
        str: 生成的扩展文本
    """
    outputs = gpt_generator(prompt, max_length=max_length, num_return_sequences=1)
    return outputs[0]['generated_text']