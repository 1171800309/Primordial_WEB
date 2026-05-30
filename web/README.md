# Primordial 用户前台（Web）

Vue 3 + Vite 单页应用。

## 目录结构

```
web/
├── docs/           # 原型 HTML（不参与构建）
├── src/            # 源码
│   ├── api/
│   ├── components/
│   ├── views/
│   └── ...
├── index.html
├── vite.config.js
├── Dockerfile
└── docker-compose.yml
```

## 开发

```bash
npm install
npm run dev
# http://localhost:5173
```

API 代理见 `.env`（复制自 `.env.example`），默认转发到 `http://localhost:5100`。

后端项目路径：`Primordial_API/api/src/Primordial.Api`。

## 构建与 Docker

```bash
npm run build
docker compose up --build   # :8080
```

## 同仓库

管理后台见 [`../admin/`](../admin/)。
