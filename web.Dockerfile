FROM node:22-alpine AS deps

WORKDIR /app

# 单独拷贝 package.json 和 package-lock.json，确保都存在
COPY web/package.json ./package.json
COPY web/package-lock.json ./package-lock.json

# 安装生产依赖
RUN npm ci --omit=dev

# 第二步：仅在需要时重建源代码
FROM node:22-alpine AS builder
WORKDIR /app

# 复用上一步的 node_modules，加快构建
COPY --from=deps /app/node_modules ./node_modules
# 正确方式：只复制 web 下的所有文件
COPY web/ .

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

# 暴露应用端口
EXPOSE 3000

# 启动
CMD ["npx", "next", "start", "--hostname", "0.0.0.0", "-p", "3000"]