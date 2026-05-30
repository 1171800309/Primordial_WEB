# Primordial 管理后台（Admin）

React + TypeScript + Vite，对接 [`Primordial_API/web`](../Primordial_API) 中的 `/api/admin/*` 路由（与用户 API 同一服务）。

## 开发

```bash
npm install
npm run dev
# http://localhost:5174
```

API 通过 Vite 代理转发到 `http://localhost:5100`（见 `.env.example`）。

## 构建

```bash
npm run build
npm run preview
```

## Docker

```bash
docker build -t primordial-admin .
docker compose up --build   # 默认映射 :8081
```

构建时可指定 API 地址（与用户前台相同的后端）：

```bash
docker build -t primordial-admin . --build-arg VITE_ADMIN_API_URL=https://api.example.com
```

## 同仓库

用户前台见 [`../web/`](../web/)。
