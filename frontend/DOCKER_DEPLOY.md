# Docker 部署指南

## 方案一：在 Docker 服务器上完整构建（推荐）

将项目源码传到你的 Docker 服务器，执行构建：

```bash
# 1. 将项目传到服务器（git clone 或 scp/rsync）
git clone <你的仓库地址> interior-design-flow
cd interior-design-flow

# 2. 构建镜像
docker build -t interior-design-flow:latest .

# 3. 运行容器
docker run -d \
  --name interior-design-flow \
  -p 8080:80 \
  --restart unless-stopped \
  interior-design-flow:latest

# 4. 验证
# 访问 http://你的服务器IP:8080
```

或使用 docker-compose：

```bash
docker-compose up -d
```

---

## 方案二：免 Node 部署（服务器无需安装 Node.js）

如果你已经在开发环境构建好了 `dist/`，可以直接用纯 Nginx 镜像运行：

### 在你的服务器上执行

```bash
# 1. 创建目录
mkdir -p ~/interior-design-flow
cd ~/interior-design-flow

# 2. 从开发机复制 dist/ 和 nginx.conf 到服务器
# （用 scp、rsync、或任何文件传输方式）
# scp -r dist/ nginx.conf  user@your-server:~/interior-design-flow/

# 3. 运行 Nginx 容器，挂载 dist 目录
docker run -d \
  --name interior-design-flow \
  -p 8080:80 \
  -v $(pwd)/dist:/usr/share/nginx/html:ro \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  --restart unless-stopped \
  nginx:alpine

# 4. 验证
# 访问 http://你的服务器IP:8080
```

> **方案二优势**：服务器无需 Node.js、无需安装 npm 依赖、构建速度极快。

---

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| `application/wasm` 404 | Nginx 未配置 wasm MIME | 已内置在 nginx.conf 中 |
| 刷新页面 404 | SPA 路由问题 | nginx.conf 已配置 `try_files` |
| 访问 http 被飞书拦截 | 飞书要求 HTTPS | 服务器需配置 SSL 证书 |
| 构建卡住/内存不足 | Node 内存限制 | 加大 Docker 内存限制或换用更大内存机器 |

---

## 启用 HTTPS（飞书必需）

飞书 H5 应用要求 **HTTPS** 访问。在你的服务器上配置 Nginx SSL：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # ... 其余配置同上
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

或使用 Let's Encrypt + certbot 自动获取免费证书。

---

## 镜像信息

| 属性 | 值 |
|------|-----|
| 基础镜像 | `nginx:alpine`（最终运行镜像约 25MB） |
| 构建镜像 | `node:24-alpine` |
| 暴露端口 | `80` |
| 数据持久化 | 无需（纯静态前端，数据存在用户浏览器 IndexedDB） |
| 健康检查 | 每 30s 检测 `http://localhost/` |
