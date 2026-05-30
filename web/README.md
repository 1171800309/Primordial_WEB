# Primordial 用户前台（Web）

Vue 3 + Vite 单页应用，对接用户端 API（`Primordial_API/web`）。

## 开发

```bash
npm install
npm run dev
# http://localhost:5173
```

API 代理见 `.env`（复制自 `.env.example`），默认转发到 `http://localhost:5100`。

## 构建

```bash
npm run build
npm run preview
```

## Docker

```bash
docker build -t primordial-web .
docker compose up --build   # 默认映射 :8080
```

构建时可指定 API 地址：

```bash
docker build -t primordial-web . --build-arg VITE_API_BASE_URL=https://api.example.com
```

## 原型参考

历史 HTML 原型位于 `docs/prototypes/`，不参与构建。

## 同仓库

管理后台见 [`../admin/`](../admin/)。
