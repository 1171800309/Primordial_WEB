# Primordial 管理后台（Admin）

React + TypeScript + Vite，对接管理端 API（`Primordial_API/admin`）。

## 开发

```bash
npm install
npm run dev
# http://localhost:5174
```

API 通过 Vite 代理转发到 `http://localhost:5101`（见 `.env.example`）。

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

构建时可指定 API 地址：

```bash
docker build -t primordial-admin . --build-arg VITE_ADMIN_API_URL=https://admin-api.example.com
```

## 同仓库

用户前台见 [`../web/`](../web/)。
