# 阶段一：构建
FROM node:24-alpine AS builder

WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# 阶段二：运行（Nginx 托管静态文件）
FROM nginx:alpine

# 添加 wasm MIME 类型到 nginx（必须，否则 sql.js WASM 无法加载）
RUN sed -i '/application\/octet-stream/a\    application/wasm  wasm;' /etc/nginx/mime.types

# 自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物到 nginx 默认目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 健康检查（使用 busybox 兼容的 wget 语法）
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
