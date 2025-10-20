# 第一步：仅在需要时安装依赖
FROM node:22-alpine AS deps

WORKDIR /app

# 拷贝项目依赖定义文件，利用缓存加速
COPY ../web/package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install --frozen-lockfile

# 第二步：仅在需要时重建源代码
FROM node:22-alpine AS builder

WORKDIR /app

# 复用上一步的 node_modules，加快构建
COPY --from=deps /app/node_modules ./node_modules
COPY .. .

# 关闭 Next.js 统计上报，防止在构建时收集遥测数据
ENV NEXT_TELEMETRY_DISABLED=1

# 构建项目
RUN npm run build

# 第三步：生产环境镜像
FROM node:22-alpine AS runner

WORKDIR /app

# 设置生产环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 仅复制构建产物和运行时必须文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/data ./data

# 暴露应用端口
EXPOSE 3000

# 启动命令
CMD ["node_modules/.bin/next", "start"]