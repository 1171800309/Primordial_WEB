# Primordial 管理后台（Admin）

React + TypeScript + Vite，对接 `Primordial_API/admin`（`:5101`）。

## 目录结构

```
admin/
├── docs/
├── src/
├── public/
├── Dockerfile
└── docker-compose.yml
```

## 开发

```bash
npm install
npm run dev
# http://localhost:5174 → 代理 http://localhost:5101
```

## 同仓库

用户前台见 [`../web/`](../web/)。
