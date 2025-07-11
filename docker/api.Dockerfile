# Stage 1: Miniconda + 环境创建
FROM continuumio/miniconda3 AS base

# 创建并激活名为 growforever 的 conda 环境
COPY api/environment.yml /tmp/environment.yml
RUN conda env create -f /tmp/environment.yml -n growforever && \
    conda clean -afy

# Stage 2: 应用镜像
FROM continuumio/miniconda3

# 把上一步创建的环境复制过来
COPY --from=base /opt/conda/envs/growforever /opt/conda/envs/growforever

# 激活环境，并设置环境变量
ENV PATH=/opt/conda/envs/growforever/bin:$PATH \
    CONDA_DEFAULT_ENV=growforever \
    PYTHONUNBUFFERED=1

WORKDIR /app

# 复制后端代码
COPY api /app

# 安装 uvicorn
RUN pip install uvicorn

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]