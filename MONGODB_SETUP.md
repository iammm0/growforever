# MongoDB 配置指南

## 快速配置

### 1. 创建/更新 `.env.local` 文件

如果还没有 `.env.local` 文件，请复制 `.env.example`：

```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# Linux/Mac
cp .env.example .env.local
```

### 2. 更新 MongoDB 配置

打开 `.env.local` 文件，确保包含以下 MongoDB 配置：

```env
# MongoDB 配置（用于知识图谱数据和用户认证）
MONGODB_URI="mongodb://admin:password@localhost:27017/growforever?authSource=admin"
MONGO_USER=admin
MONGO_PASSWORD=password
MONGO_DB=growforever
MONGO_PORT=27017
```

### 3. 配置说明

#### MongoDB URI 格式
```
mongodb://用户名:密码@主机:端口/数据库名?authSource=admin
```

**参数说明**：
- `用户名`：MongoDB 管理员用户名（默认：admin）
- `密码`：MongoDB 管理员密码（默认：password）
- `主机`：MongoDB 服务器地址（本地开发：localhost）
- `端口`：MongoDB 端口（默认：27017）
- `数据库名`：要使用的数据库名称（默认：growforever）
- `authSource=admin`：指定认证数据库为 admin

#### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `MONGODB_URI` | MongoDB 连接字符串 | `mongodb://admin:password@localhost:27017/growforever?authSource=admin` |
| `MONGO_USER` | MongoDB 用户名 | `admin` |
| `MONGO_PASSWORD` | MongoDB 密码 | `password` |
| `MONGO_DB` | 数据库名称 | `growforever` |
| `MONGO_PORT` | MongoDB 端口 | `27017` |

### 4. 启动 MongoDB 服务

使用 Docker Compose 启动 MongoDB：

```bash
docker-compose up -d mongodb
```

检查 MongoDB 是否正常运行：

```bash
# 检查容器状态
docker ps | grep mongodb

# 查看 MongoDB 日志
docker logs mongodb
```

### 5. 验证连接

启动开发服务器后，检查控制台输出：

```
✅ MongoDB connected
```

如果看到此消息，说明 MongoDB 连接成功。

## 常见问题

### 问题 1：连接失败

**错误信息**：
```
❌ MongoDB connect failed: connect ECONNREFUSED 127.0.0.1:27017
```

**解决方案**：
1. 确保 MongoDB 容器正在运行：`docker ps`
2. 检查端口是否被占用：`netstat -an | findstr 27017` (Windows) 或 `lsof -i :27017` (Linux/Mac)
3. 重启 MongoDB 容器：`docker-compose restart mongodb`

### 问题 2：认证失败

**错误信息**：
```
❌ MongoDB connect failed: Authentication failed
```

**解决方案**：
1. 检查 `.env.local` 中的用户名和密码是否正确
2. 确保 `MONGO_USER` 和 `MONGO_PASSWORD` 与 `docker-compose.yml` 中的配置一致
3. 如果修改了密码，需要重新创建 MongoDB 容器：
   ```bash
   docker-compose down mongodb
   docker volume rm growforever-web_mongo_data  # 删除数据卷（注意：会删除所有数据）
   docker-compose up -d mongodb
   ```

### 问题 3：数据库不存在

MongoDB 会在首次连接时自动创建数据库和集合，无需手动创建。

如果遇到问题，可以手动连接 MongoDB 检查：

```bash
# 使用 mongo shell 连接
docker exec -it mongodb mongosh -u admin -p password

# 在 mongo shell 中
use growforever
show collections
```

## 生产环境配置

在生产环境中，请务必：

1. **修改默认密码**：使用强密码替换默认的 `password`
2. **使用环境变量**：不要在代码中硬编码密码
3. **启用 SSL/TLS**：如果 MongoDB 服务器支持，在 URI 中添加 SSL 参数
4. **使用连接池**：Mongoose 默认使用连接池，无需额外配置
5. **设置备份策略**：定期备份 MongoDB 数据

### 生产环境 MongoDB URI 示例

```env
# 使用 SSL 连接
MONGODB_URI="mongodb://username:strong-password@mongodb.example.com:27017/growforever?authSource=admin&ssl=true"

# 使用 MongoDB Atlas（云服务）
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/growforever?retryWrites=true&w=majority"
```

## 数据迁移

如果之前使用 PostgreSQL，数据需要手动迁移到 MongoDB。MongoDB 会自动创建集合，但需要确保：

1. 数据结构与 Mongoose 模型匹配
2. ID 字段从整数转换为 ObjectId
3. 关系字段（如 seedId, parentId）使用 ObjectId 引用

## 相关文件

- `lib/mongodb.ts` - MongoDB 连接配置
- `models/` - Mongoose 模型定义
- `docker-compose.yml` - MongoDB 容器配置
- `.env.example` - 环境变量模板

