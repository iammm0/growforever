# 使用官方 Python 镜像作为基础镜像
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt /app/

# 先安装PyTorch GPU版本（CUDA 12.4）
# 注意：PyTorch GPU版本需要从PyTorch官网安装
# 需要至少 2.6 版本以满足 transformers 的安全要求（CVE-2025-32434）
# 使用 --extra-index-url 而不是 --index-url，避免依赖包元数据冲突
RUN pip install --no-cache-dir "torch>=2.6.0" torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu124

# 安装其他Python依赖
# pip会检测到torch已安装并满足版本要求，不会重新安装
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目代码到容器内
COPY . /app/

# 创建 models 目录（确保目录存在）
RUN mkdir -p /app/models

# 注意：模型文件较大，可以选择：
# 1. 在构建时复制已存在的模型（取消下面的注释）
# 2. 或者在运行时从 HuggingFace 自动下载（推荐，减少镜像大小）
# COPY models/ /app/models/

# 开放 FastAPI 默认的端口
EXPOSE 8000

# 运行 FastAPI 应用
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]