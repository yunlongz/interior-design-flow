# 内装设计全流程交互图

> Vue 3 + TypeScript + Pinia + sql.js (前端 SQLite) 重构版

一个可视化展示内装设计全流程的交互式图表工具，支持节点浏览、上下游依赖追踪、拖拽排序、节点编辑、数据导出/导入等功能。

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Vue 3.4 + Composition API | 现代化响应式框架 |
| 构建 | Vite 5 | 极速构建与热更新 |
| 类型 | TypeScript 5 | 全链路类型安全 |
| 状态 | Pinia | 轻量级状态管理 |
| 存储 | sql.js (SQLite WASM) | 浏览器内运行真实 SQLite，零后端依赖 |
| 持久化 | IndexedDB | 自动保存数据库快照到浏览器 |

---

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建（输出到 dist/ 目录）
npm run build

# 预览生产构建
npm run preview
```

---

## 独立部署

本项目纯前端构建，输出为静态文件，可部署到任意 Web 服务器：

```bash
npm run build
# 将 dist/ 目录下所有文件上传到服务器即可
```

> 注意：`dist/` 目录内需包含 `sql-wasm.wasm` 文件，这是 sql.js 运行所需的 WebAssembly 模块。

---

## 数据库设计

采用 SQLite 关系型数据模型，包含 4 张核心表：

### 表结构

| 表名 | 说明 |
|------|------|
| `phases` | 阶段表（8 个设计阶段） |
| `departments` | 部门表（22 个参与部门） |
| `nodes` | 节点表（约 100 个任务/交付物/评审/决策/里程碑节点） |
| `connections` | 连线关系表（节点间的依赖关系） |

### 视图

- `v_nodes_full`：节点完整信息视图（含阶段名、部门名）

### 数据持久化

- **自动保存**：每次数据修改后，自动将 SQLite 数据库导出为 Uint8Array 保存到 IndexedDB
- **导出 `.db` 文件**：点击顶部"导出数据"按钮，可下载完整的 SQLite 数据库文件
- **导入 `.db` 文件**：点击"导入数据"按钮，可恢复之前导出的数据库文件
- **恢复默认**：一键重置为内置默认数据

---

## 项目目录结构

```
interior-design-flow/
├── public/
│   └── sql-wasm.wasm              # sql.js WASM 运行时
├── src/
│   ├── components/                # Vue UI 组件
│   │   ├── AppHeader.vue          # 顶部栏（搜索、部门筛选、导出/导入）
│   │   ├── PhaseNav.vue           # 左侧阶段导航
│   │   ├── FlowCanvas.vue         # 主画布（已整合到 App.vue）
│   │   ├── PhaseBlock.vue         # 阶段卡片（可折叠）
│   │   ├── DeptLane.vue           # 部门泳道（可折叠、可拖拽排序）
│   │   ├── TaskNode.vue           # 任务节点卡片
│   │   ├── ConnectionLayer.vue    # SVG 贝塞尔连线层
│   │   ├── DetailPanel.vue        # 右侧节点详情/编辑面板
│   │   ├── MiniMap.vue            # 小地图导航
│   │   ├── ZoomControls.vue       # 缩放控制
│   │   ├── LegendBar.vue          # 底部图例
│   │   └── ToastMessage.vue       # 消息提示
│   ├── stores/                    # Pinia 状态管理
│   │   ├── flowStore.ts           # 流程数据核心状态
│   │   └── uiStore.ts             # UI 交互状态
│   ├── db/                        # 数据库层
│   │   ├── init.sql               # 建表 + 默认数据 SQL
│   │   ├── DatabaseManager.ts     # sql.js 单例封装（IndexedDB 持久化）
│   │   └── dao/                   # 数据访问对象
│   │       ├── PhaseDao.ts
│   │       ├── DepartmentDao.ts
│   │       ├── NodeDao.ts
│   │       └── ConnectionDao.ts
│   ├── types/                     # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.vue                    # 根组件（布局组装）
│   └── main.ts                    # 应用入口
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 核心功能

| 功能 | 说明 |
|------|------|
| 阶段导航 | 左侧 8 阶段快捷跳转 |
| 部门筛选 | 顶部多选下拉，动态过滤显示 |
| 节点可视化 | 5 种类型（任务/评审/交付物/决策/里程碑），颜色区分 |
| SVG 连线 | 贝塞尔曲线连接上下游，悬停显示关系类型 |
| 上下游高亮 | 点击节点高亮关联路径，其他节点置灰 |
| 拖拽排序 | 同部门内拖拽调整节点顺序，自动保存 |
| 节点编辑 | 右侧面板可修改阶段、部门、详情描述 |
| 搜索 | 实时搜索任务标题、部门、阶段 |
| 缩放 | Ctrl + 滚轮 / 按钮控制缩放 |
| 小地图 | 右下角缩略图，点击快速定位 |
| 数据导出/导入 | 导出 `.db` 文件，支持备份与迁移 |

---

## 后续打包预留

`vite.config.ts` 已配置 `base: './'`，支持相对路径部署。未来扩展：

- **静态站点**：当前默认输出，直接部署 `dist/`
- **桌面应用**：可接入 Electron / Tauri（需新增入口）
- **内嵌组件**：可开启 Vite lib 模式打包为 UMD/ES 模块

---

## 数据迁移说明

原 HTML 版本的 `localStorage` 数据无法直接迁移到 SQLite 版本（数据结构完全不同）。建议：

1. 使用新版本重新配置流程
2. 或使用"导出/导入"功能在浏览器间迁移 `.db` 文件
