"""全局配置加载模块"""
from pathlib import Path
import yaml

# 默认配置文件路径
CONFIG_PATH = Path(__file__).resolve().parents[1] / "config" / "config.yaml"

with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
    CONFIG = yaml.safe_load(f)
