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

API 代理见 `.env`（复制自 `.env.example`），默认转发到 `https://127.0.0.1:58725`（与用户 API F5 调试端口一致）。

后端项目路径：`Primordial_API/web/src/Primordial.Api`。

### 纯前端设计预览

无需启动后端，所有接口请求会在浏览器内使用演示数据响应：

```bash
npm install
npm run dev:design
```

设计调整记录见 [`docs/adjustments/`](./docs/adjustments/)。

## 构建与 Docker

```bash
npm run build
docker compose up --build   # :8080
```

## 同仓库

管理后台见 [`../admin/`](../admin/)。
