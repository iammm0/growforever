# 用户认证系统

## 功能概述

本系统提供了完整的用户认证功能，包括：

### 用户认证系统
- ✅ 用户注册（邮箱、用户名、密码）
- ✅ 用户登录（邮箱、密码）
- ✅ 用户登出
- ✅ JWT Token 认证（7天有效期）
- ✅ Cookie 和 Authorization Header 双重支持

### 用户资料管理
- ✅ 头像上传和更改
- ✅ 基本信息修改（用户名、个人简介）
- ✅ 公开信息设置（显示名称、所在地、个人网站、社交媒体链接）
- ✅ 公开信息展示

## 技术栈

- **数据库**: MongoDB（使用 Mongoose）
- **认证**: JWT（jsonwebtoken）
- **密码加密**: bcryptjs
- **前端框架**: Next.js 15 + React 19
- **UI 组件**: Material-UI (MUI)
- **状态管理**: React Context API

## 数据库模型

### User 模型
```typescript
{
  email: string (唯一)
  password: string (加密)
  username: string (唯一, 3-30字符)
  avatar?: string (base64图片)
  bio?: string (最多500字)
  publicInfo?: {
    displayName?: string
    location?: string
    website?: string
    socialLinks?: {
      twitter?: string
      instagram?: string
      github?: string
    }
  }
  createdAt: Date
  updatedAt: Date
}
```

## API 路由

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 用户资料相关
- `GET /api/user/profile` - 获取当前用户资料
- `PATCH /api/user/profile` - 更新用户资料
- `POST /api/user/avatar` - 上传头像
- `GET /api/user/public/[userId]` - 获取用户公开信息

## 前端页面

- `/auth/login` - 登录页面
- `/auth/register` - 注册页面
- `/profile` - 个人资料管理页面（需要登录）

## 环境变量配置

在 `.env.local` 文件中添加以下配置：

```env
# MongoDB 配置
MONGODB_URI="mongodb://admin:password@localhost:27017/growforever?authSource=admin"
MONGO_USER=admin
MONGO_PASSWORD=password
MONGO_DB=growforever
MONGO_PORT=27017

# JWT 密钥（生产环境请使用强密钥）
JWT_SECRET="your-secret-key-change-in-production"
```

## 启动步骤

1. **启动 MongoDB 服务**
```bash
docker-compose up -d mongodb
```

2. **安装依赖**（如果还没有）
```bash
npm install
```

3. **配置环境变量**
创建 `.env.local` 文件并添加上述配置

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
- 访问 http://localhost:3000
- 点击右上角"注册"创建账号
- 登录后可以访问"个人资料"管理个人信息

## Navigation 组件

Navigation 组件包含：
- 右侧：
  - 未登录：显示"登录"和"注册"按钮
  - 已登录：显示用户头像，点击可访问个人资料或登出

## 注意事项

1. **图片存储**: 当前实现使用 base64 编码存储图片，适合小文件。生产环境建议使用云存储服务（如 AWS S3、Cloudinary 等）

2. **JWT 密钥**: 生产环境请务必更改 `JWT_SECRET` 为强随机密钥

3. **密码安全**: 密码使用 bcryptjs 加密，默认强度为 10

4. **文件大小限制**:
   - 头像：最大 5MB

5. **MongoDB 连接**: 确保 MongoDB 服务正在运行，连接字符串格式正确

## 后续优化建议

1. 添加邮箱验证功能
2. 添加密码重置功能
3. 添加用户关注功能
4. 优化图片上传，使用云存储服务
5. 添加响应式设计优化
6. 添加单元测试和集成测试

