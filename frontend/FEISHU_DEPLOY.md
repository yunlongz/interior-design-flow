# 飞书应用部署指南

## 概述

本项目已适配飞书网页应用部署，支持在飞书 PC 端、iOS、Android 客户端内直接访问。

**技术适配说明**：
- ✅ 接入 `@vitejs/plugin-legacy`，自动兼容 Chrome 75+ / iOS 12+
- ✅ 移除全部 ES2020+ 语法（`?.` 可选链、`??` 空值合并），兼容旧版 WebView
- ✅ 移动端响应式适配（阶段导航隐藏、详情面板全屏、小地图/缩放控件隐藏）
- ✅ sql.js WASM 文件使用相对路径，支持子目录部署

---

## 前置条件

| 条件 | 说明 |
|------|------|
| 飞书企业账号 | 需有企业管理员或应用开发者权限 |
| 公网服务器 | 支持 HTTPS 访问（或 GitHub Pages / Cloudflare Pages / 内网穿透） |
| Node.js | v18+（开发机使用，构建产物为纯静态文件，服务器无需 Node） |

---

## 第一步：构建生产包

```bash
# 安装依赖（如未安装）
npm install

# 构建生产包
npm run build
```

构建完成后，`dist/` 目录包含以下文件：

```
dist/
├── index.html              # 入口页面
├── favicon.svg             # 图标
├── icons.svg               # 图标精灵
├── sql-wasm-browser.js     # sql.js UMD 包（必须保留）
├── sql-wasm.wasm           # SQLite WASM 文件（必须保留）
└── assets/
    ├── index-*.js          # 现代浏览器主包
    ├── index-legacy-*.js   # 旧版浏览器降级包
    ├── polyfills-*.js      # 现代浏览器 polyfill
    ├── polyfills-legacy-*.js # 旧版浏览器 polyfill
    └── index-*.css         # 样式文件
```

> **注意**：`sql-wasm-browser.js` 和 `sql-wasm.wasm` 是从 `public/` 目录复制而来，**不可删除**，否则 SQLite 数据库无法初始化。

---

## 第二步：部署到公网服务器

将 `dist/` 目录中的所有文件上传到任意静态文件服务器：

| 部署方式 | 说明 |
|---------|------|
| **Nginx / Apache** | 将 `dist/` 内容放到网站根目录或子目录，配置 MIME 类型 `.wasm` → `application/wasm` |
| **GitHub Pages** | 推送到仓库的 `gh-pages` 分支，或使用 Actions 自动部署 |
| **Cloudflare Pages** | 直接上传 `dist/` 文件夹 |
| **对象存储 + CDN** | 阿里云 OSS / 腾讯云 COS / AWS S3 等 |
| **内网穿透** | 开发测试时使用 ngrok / cpolar 等工具临时暴露本地服务 |

### Nginx 配置参考

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    root /var/www/interior-design-flow;
    index index.html;
    
    # 必须配置 wasm MIME 类型
    types {
        application/wasm  wasm;
    }
    
    # 单页应用路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|wasm|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 部署后验证

访问部署地址，确认：
1. 页面正常加载，显示"正在初始化数据库..."后进入主界面
2. 按 F12 → Network → 确认 `sql-wasm.wasm` 请求 200 成功
3. 节点、连线、阶段导航等功能正常

---

## 第三步：飞书开放平台配置

### 3.1 创建企业自建应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 登录企业账号 → 进入「开发者后台」
3. 点击「创建应用」→ 选择「企业自建应用」
4. 填写应用名称（如「内装设计流程图」）、上传图标、填写描述
5. 记录 **App ID** 和 **App Secret**（后续如需免登会用到）

### 3.2 启用网页应用能力

1. 进入应用详情 → 「应用能力」
2. 点击「添加应用能力」→ 选择「网页应用」
3. 配置以下字段：

| 字段 | 填写内容 |
|------|---------|
| 桌面端主页 | `https://your-domain.com/index.html`（或子目录路径） |
| 移动端主页 | 与桌面端相同（或单独配置移动端优化版） |

> 如果部署到子目录，如 `https://your-domain.com/app/`，则填写 `https://your-domain.com/app/index.html`

### 3.3 配置 H5 可信域名

1. 进入「安全设置」→ 「H5 可信域名」
2. 点击「添加域名」
3. 输入**纯域名**（不含协议、不含路径）：
   - 正确：`your-domain.com`
   - 错误：`https://your-domain.com` 或 `your-domain.com/app`
4. 如果部署到子目录，只需添加根域名即可

### 3.4 配置权限（可选）

如果后续需要接入飞书免登获取用户信息：
1. 「权限管理」→ 添加以下权限：
   - `contact:user.base:readonly`（获取用户基本信息）
   - `contact:user.employee_id:readonly`（获取用户 user_id）
2. 「安全设置」→ 添加「重定向 URL」：
   - `https://your-domain.com/index.html`

> **当前版本暂不支持免登**，如需此功能需要额外开发后端服务处理 OAuth 2.0 流程。

### 3.5 发布应用

1. 「版本管理与发布」→ 点击「创建版本」
2. 填写版本号（如 1.0.0）、更新说明
3. 设置「应用可用范围」（选择可使用该应用的部门/人员）
4. 提交审核 → 企业管理员审批 → 发布

### 3.6 访问应用

发布后，被授权的用户可在飞书：
- **PC 端**：工作台 → 找到应用图标 → 点击打开
- **移动端**：工作台 → 找到应用图标 → 点击打开

---

## 第四步：兼容性验证

### 必测清单

| 平台 | 验证项 | 期望结果 |
|------|--------|---------|
| 飞书 PC 端（Windows/Mac） | 页面加载、节点显示、连线、详情面板、搜索、缩放 | 全部正常 |
| 飞书 iOS | 页面加载、节点显示、IndexedDB 持久化 | 全部正常 |
| 飞书 Android（重点） | 页面加载、WASM 加载、数据库初始化 | 全部正常 |
| 飞书 Android 旧机型 | 无白屏、无控制台报错 | 正常显示 |

### 常见问题排查

| 现象 | 可能原因 | 解决方案 |
|------|---------|---------|
| 页面白屏 | Android WebView 不支持 ES2020+ | legacy 插件已处理，如仍白屏检查是否遗漏 `?.` 语法 |
| "数据库初始化失败" | `sql-wasm.wasm` 404 或 MIME 类型错误 | 确认服务器配置了 `.wasm` → `application/wasm` |
| 数据无法保存 | IndexedDB 被禁用 | 飞书 WebView 默认启用 IDB，如被禁需联系管理员 |
| 样式错乱 | 移动端布局未适配 | 已添加 `@media (max-width: 768px)` 响应式规则 |
| 打开后一直"正在初始化数据库..." | `sql-wasm-browser.js` 未加载 | 检查 Network 面板，确认 js 文件 200 |

---

## 第五步：后续维护

### 更新应用

1. 修改代码后重新执行 `npm run build`
2. 将新的 `dist/` 文件上传到服务器（覆盖旧文件）
3. 飞书开放平台 → 「版本管理与发布」→ 创建新版本 → 发布
4. 用户下次打开应用即可看到更新

### 数据备份

用户数据存储在浏览器 IndexedDB 中，**换设备或清缓存会丢失**。

建议定期使用「导出数据」功能备份 `.db` 文件，必要时通过「导入数据」恢复。

---

## 附录：技术架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        飞书客户端                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  PC 端       │  │  iOS WKWebView │  │ Android WebView   │ │
│  │  (Electron)  │  │  (兼容极好)    │  │ (Chrome 75+)      │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         └─────────────────┴────────────────────┘            │
│                           │                                 │
│                    HTTPS 加载                               │
│                           ▼                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │  静态服务器   │
                    │  (Nginx/CDN) │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────┐      ┌───────────┐      ┌──────────┐
   │ index.html │   │ JS/CSS    │      │ sql.js   │
   │ (legacy   │   │ bundles   │      │ WASM     │
   │  auto-detect)│ │           │      │          │
   └─────────┘      └───────────┘      └────┬─────┘
                                            │
                                            ▼
                                    ┌──────────────┐
                                    │ SQLite (内存)  │
                                    │  + IndexedDB   │
                                    │  持久化        │
                                    └──────────────┘
```
