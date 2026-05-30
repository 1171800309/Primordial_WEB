# Primordial 管理后台（Admin）

React + TypeScript + Vite 管理端 SPA。

## 目录结构

```
admin/
├── docs/           # 管理端说明（本文件）
├── src/            # 页面、组件、API 封装
├── public/         # 静态图标
├── index.html
├── vite.config.ts
├── Dockerfile
└── docker-compose.yml
```

## 开发

```bash
npm install
npm run dev
# http://localhost:5174
```

API 通过 Vite 代理转发到 `http://localhost:5100`（与用户 API 同一服务，路由前缀 `/api/admin/*`）。

## 构建与 Docker

```bash
npm run build
docker compose up --build   # :8081
```

## 同仓库

用户前台见 [`../web/`](../web/)。
