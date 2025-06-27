FROM python:3.11-slim

# 安装 Poetry
ENV POETRY_VERSION=1.7.1
RUN pip install "poetry==$POETRY_VERSION"

# 设置工作目录
WORKDIR /app

# 拷贝项目文件（用 pyproject.toml 来缓存 Poetry layer）
COPY pyproject.toml poetry.lock* /app/

# 关闭虚拟环境（让 poetry 安装到系统 site-packages）
ENV POETRY_VIRTUALENVS_CREATE=false

RUN poetry install --no-root --only main

# 拷贝源代码
COPY app /app/app

# 启动服务
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]