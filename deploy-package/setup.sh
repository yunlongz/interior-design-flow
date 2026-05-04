#!/bin/bash
# 服务器端一键准备脚本
# 用法：在服务器上执行 bash setup.sh

set -e

APP_DIR="/opt/interior-design-flow"

echo "=== 内装设计流程图 - 服务器部署准备 ==="

# 创建目录
echo "[1/3] 创建应用目录 $APP_DIR ..."
mkdir -p "$APP_DIR"

# 复制文件（假设本脚本和 dist/、nginx.conf 在同一目录）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "[2/3] 复制 dist/ 和 nginx.conf ..."
cp -r "$SCRIPT_DIR/dist" "$APP_DIR/"
cp "$SCRIPT_DIR/nginx.conf" "$APP_DIR/"

echo "[3/3] 验证文件 ..."
if [ -f "$APP_DIR/dist/index.html" ] && [ -f "$APP_DIR/dist/sql-wasm.wasm" ] && [ -f "$APP_DIR/nginx.conf" ]; then
    echo "✅ 文件准备完成！"
    echo ""
    echo "下一步：在 Portainer 中创建容器"
    echo "  - Image: nginx:alpine"
    echo "  - 端口映射: 8080 -> 80"
    echo "  - Volume 1 (Bind): $APP_DIR/dist -> /usr/share/nginx/html"
    echo "  - Volume 2 (Bind): $APP_DIR/nginx.conf -> /etc/nginx/conf.d/default.conf"
    echo "  - Restart policy: Unless stopped"
    echo ""
    echo "部署后访问: http://$(hostname -I | awk '{print $1}'):8080"
else
    echo "❌ 文件缺失，请检查 deploy-package 目录"
    exit 1
fi
