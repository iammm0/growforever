# 部署指南

本指南介绍如何部署GPT Service到生产环境。

## 环境要求

- Python 3.10+
- Docker & Docker Compose（推荐）
- 至少16GB RAM
- NVIDIA GPU（推荐，用于模型推理和训练）
- 至少50GB磁盘空间（用于模型存储）

## 快速部署

### 使用Docker Compose

1. **克隆项目**
```bash
cd gpt-service
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件
```

3. **启动服务**
```bash
docker-compose up -d
```

4. **查看日志**
```bash
docker-compose logs -f gpt-service
```

5. **验证部署**
```bash
curl http://localhost:8000/health
```

## 手动部署

### 1. 安装依赖

```bash
# 创建虚拟环境
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 安装GPU版本的PyTorch（可选）
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### 2. 配置

编辑 `config/prod.yaml`：

```yaml
environment: prod
logging:
  level: INFO
  format: json
  file_enabled: true
api:
  host: 0.0.0.0
  port: 8000
```

### 3. 启动服务

```bash
# 使用uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000

# 或使用gunicorn（生产环境推荐）
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 生产环境配置

### 1. 使用Gunicorn

安装Gunicorn：
```bash
pip install gunicorn
```

启动命令：
```bash
gunicorn main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 300 \
  --access-logfile - \
  --error-logfile -
```

### 2. 使用Systemd

创建服务文件 `/etc/systemd/system/gpt-service.service`：

```ini
[Unit]
Description=GPT Service
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/gpt-service
Environment="PATH=/opt/gpt-service/.venv/bin"
ExecStart=/opt/gpt-service/.venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl enable gpt-service
sudo systemctl start gpt-service
sudo systemctl status gpt-service
```

### 3. 使用Nginx反向代理

Nginx配置示例：

```nginx
upstream gpt_service {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://gpt_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket支持（用于流式生成）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

### 4. SSL/TLS配置

使用Let's Encrypt：

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Docker部署

### 构建镜像

```bash
docker build -t gpt-service:latest .
```

### 运行容器

```bash
docker run -d \
  --name gpt-service \
  -p 8000:8000 \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/logs:/app/logs \
  -e ENVIRONMENT=prod \
  gpt-service:latest
```

### 使用Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart
```

## 监控和日志

### 日志位置

- 开发环境: 控制台输出
- 生产环境: `logs/gpt-service.log`

### 日志轮转

日志文件自动轮转：
- 最大大小: 100MB（生产环境）
- 保留数量: 10个文件

### 健康检查

```bash
# 检查服务健康状态
curl http://localhost:8000/health

# 检查Ollama状态
curl http://localhost:8000/ollama/stats
```

## 性能优化

### 1. 模型缓存

在 `config/prod.yaml` 中启用缓存：

```yaml
cache:
  enabled: true
  type: redis
```

### 2. GPU优化

- 使用FP16/BF16混合精度
- 启用模型量化（4bit/8bit）
- 使用多个GPU进行负载均衡

### 3. 并发处理

调整Gunicorn worker数量：

```bash
# CPU核心数 * 2 + 1
gunicorn main:app -w 9 -k uvicorn.workers.UvicornWorker
```

## 安全建议

### 1. 认证

生产环境建议添加API认证：

```python
from fastapi import Depends, HTTPException, Security
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != "your-secret-key":
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return api_key
```

### 2. 限流

使用中间件限制请求频率：

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/generate")
@limiter.limit("10/minute")
def generate(request: Request, ...):
    ...
```

### 3. CORS配置

生产环境限制CORS：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## 备份和恢复

### 备份模型

```bash
# 备份模型目录
tar -czf models-backup-$(date +%Y%m%d).tar.gz models/

# 备份配置
cp -r config config-backup-$(date +%Y%m%d)
```

### 恢复

```bash
# 恢复模型
tar -xzf models-backup-YYYYMMDD.tar.gz

# 恢复配置
cp -r config-backup-YYYYMMDD/* config/
```

## 故障排查

### 服务无法启动

1. 检查端口是否被占用
2. 检查日志文件
3. 验证配置文件格式

### 模型加载失败

1. 检查模型路径
2. 验证GPU/CUDA可用性
3. 检查磁盘空间

### 性能问题

1. 检查GPU使用率
2. 查看日志中的错误信息
3. 调整批次大小和并发数

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d
```

## 扩展部署

### 水平扩展

使用负载均衡器（如Nginx）分发请求到多个实例：

```nginx
upstream gpt_service {
    least_conn;
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}
```

### 垂直扩展

增加服务器资源：
- 更多GPU内存
- 更多CPU核心
- 更多RAM

