# Portainer Add Container 部署指南

> 方案：Add Container + 挂载 dist（无需构建镜像，直接用 nginx:alpine）

---

## 第一步：把文件传到服务器

将 `deploy-package/` 目录复制到你的 Portainer 服务器上。

### 方式一：命令行（推荐）

在 **Windows 开发机**上执行（PowerShell）：

```powershell
# 先打包
Compress-Archive -Path "E:\my-project-kimi\anxin-okr\interior-design-flow\deploy-package\*" -DestinationPath "E:\my-project-kimi\anxin-okr\interior-design-flow\deploy-package.zip" -Force

# 然后上传到服务器（修改为你的服务器 IP）
scp "E:\my-project-kimi\anxin-okr\interior-design-flow\deploy-package.zip" root@your-server-ip:/opt/
```

在 **服务器**上解压：

```bash
ssh root@your-server-ip
cd /opt
unzip deploy-package.zip -d interior-design-flow
bash interior-design-flow/setup.sh
```

### 方式二：WinSCP / FileZilla（图形化）

1. 用 WinSCP 或 FileZilla 连接服务器
2. 在服务器创建 `/opt/interior-design-flow/` 目录
3. 把本地 `deploy-package/dist/` 和 `deploy-package/nginx.conf` 上传到该目录

确认服务器上的最终文件结构：

```
/opt/interior-design-flow/
├── dist/                    ← 前端构建产物
│   ├── index.html
│   ├── sql-wasm-browser.js
│   ├── sql-wasm.wasm
│   └── assets/
└── nginx.conf               ← Nginx 配置
```

---

## 第二步：Portainer 创建容器

### 2.1 登录 Portainer

打开浏览器访问 `http://your-server:9000`，登录你的 Portainer。

### 2.2 进入 Add Container

1. 在左侧菜单点击 **Containers**
2. 点击右上角 **Add container** 按钮

### 2.3 填写基本信息

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Name | `interior-design-flow` | 容器名称 |
| Image | `nginx:alpine` | 使用 Nginx Alpine 镜像 |
| Always pull the image | ✅ 勾选 | 首次自动拉取镜像 |
| Publish all exposed ports | ❌ 不勾选 | 不用自动映射 |

### 2.4 配置端口映射

点击 **Manual network port publishing** 区域的 **publish a new network port**：

| Host | Container |
|------|-----------|
| `8080` | `80` |

> 你可以把 Host 端口改成任意你想要的端口（如 80、3000、8080 等）。

### 2.5 配置卷挂载（最关键！）

点击 **Volumes** 展开，添加两个 Bind mount：

**第一个卷（网站文件）：**

| 字段 | 值 |
|------|-----|
| Type | `Bind` |
| Container | `/usr/share/nginx/html` |
| Host | `/opt/interior-design-flow/dist` |

点击 **map additional volume** 添加第二个：

**第二个卷（Nginx 配置）：**

| 字段 | 值 |
|------|-----|
| Type | `Bind` |
| Container | `/etc/nginx/conf.d/default.conf` |
| Host | `/opt/interior-design-flow/nginx.conf` |

### 2.6 配置重启策略

点击 **Restart policy** 下拉框，选择 `Unless stopped`。

这样容器在服务器重启后会自动启动。

### 2.7 部署容器

点击页面底部的 **Deploy the container** 按钮。

Portainer 会拉取 nginx:alpine 镜像并创建容器，等待约 10~30 秒。

---

## 第三步：验证

### 3.1 容器状态检查

在 Portainer → Containers 页面，确认 `interior-design-flow` 容器状态为 **Running**（绿色）。

### 3.2 浏览器访问

打开浏览器访问：

```
http://your-server-ip:8080
```

你应该看到「正在初始化数据库...」→ 加载完成后显示流程图主界面。

### 3.3 检查 WASM 加载

按 F12 → Network 面板 → 确认 `sql-wasm.wasm` 请求状态为 200（绿色）。

如果 WASM 加载失败（404 或 CORS 错误），检查 nginx.conf 中的 `types` 配置是否正确。

---

## 第四步：配置 HTTPS（飞书必需）

飞书 H5 应用要求 **HTTPS**。你需要配置反向代理或 SSL。

### 推荐方案：Nginx Proxy Manager（也是用 Portainer 部署）

如果你已有 Nginx Proxy Manager 或 Traefik：

1. 在 Nginx Proxy Manager 中添加一个 Proxy Host
2. Domain Names: `your-domain.com`
3. Forward Hostname/IP: `your-server-ip`
4. Forward Port: `8080`
5. 申请 Let's Encrypt SSL 证书
6. 开启 **Force SSL**

然后在飞书开放平台填写 `https://your-domain.com`。

### 手动配置 Nginx SSL

如果你有独立的 Nginx 容器做反向代理，添加如下配置：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 更新应用

后续代码更新时，只需：

1. 在开发机重新执行 `npm run build`
2. 把新的 `dist/` 复制到服务器的 `/opt/interior-design-flow/dist`（覆盖旧文件）
3. 在 Portainer 中选中容器 → 点击 **Restart** 按钮

无需重新创建容器，重启即可生效。

---

## 故障排查

| 现象 | 原因 | 解决 |
|------|------|------|
| 容器无法启动 | 挂载路径不存在 | 确认 `/opt/interior-design-flow/dist` 和 `nginx.conf` 存在于服务器 |
| 页面空白 | dist/ 文件缺失 | 检查 dist/index.html 是否存在 |
| sql-wasm.wasm 404 | MIME 类型未配置 | nginx.conf 已包含 `application/wasm`，检查是否挂载成功 |
| 样式错乱 | CSS 未加载 | 检查 assets/ 目录是否在 dist/ 中 |
| 端口无法访问 | 防火墙未开放 | 服务器执行 `ufw allow 8080` 或 `iptables -I INPUT -p tcp --dport 8080 -j ACCEPT` |
| 飞书无法打开 | 未使用 HTTPS | 配置 SSL 证书，使用 https 访问 |
