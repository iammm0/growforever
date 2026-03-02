from config.config import CONFIG
from text_generation.gpt_module_plus import build_generator_from_CONFIG

generator = build_generator_from_CONFIG(CONFIG)

def generate_text(prompt: str, user_profile: dict) -> str:
    return generator.generate_text(prompt, user_profile)

# 如果要更长的文章（先提纲再扩写）：
def generate_long_article(prompt: str, user_profile: dict) -> str:
    return generator.generate_longform(prompt, user_profile, outline_sections=6, section_tokens=600)