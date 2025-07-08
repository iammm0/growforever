FROM python:3.10-slim

# 避免 Python 输出缓冲，方便查看日志
ENV PYTHONUNBUFFERED=1

# 创建并激活虚拟环境
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 设置工作目录
WORKDIR /app

# 先拷贝依赖文件，利用 Docker 缓存
COPY requirements.txt .

# 安装依赖
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 拷贝应用源代码
COPY app/ ./app/

# 默认监听 0.0.0.0:8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]