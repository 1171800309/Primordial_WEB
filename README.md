# Primordial 前端 Monorepo

用户前台与管理后台分属两个独立包，共用同一后端 API 仓库 [`Primordial_API`](../Primordial_API)。

## 目录结构

```
Primordial_WEB/
├── web/                  # 用户前台（Vue 3）
│   ├── docs/             # 原型与说明
│   ├── src/              # 页面与组件
│   ├── public/           # （静态资源主要在 src/assets）
│   ├── Dockerfile
│   └── docker-compose.yml
└── admin/                # 管理后台（React）
    ├── docs/
    ├── src/
    ├── public/
    ├── Dockerfile
    └── docker-compose.yml
```

## 命名约定

| 名称 | 含义 |
|------|------|
| `Primordial_WEB` | 前端仓库（本仓库） |
| `web/` | 用户端 SPA |
| `admin/` | 管理端 SPA |
| `Primordial_API/api` | 统一后端（非独立 admin-api） |

## 本地开发

```bash
# 后端（另开终端）
cd ../Primordial_API/api/src/Primordial.Api && dotnet run

# 用户前台
cd web && npm install && npm run dev    # :5173

# 管理后台
cd admin && npm install && npm run dev  # :5174
```

## Docker

各包目录内独立构建：

```bash
cd web && docker compose up --build    # :8080
cd admin && docker compose up --build  # :8081
```

详见各包下的 `README.md`。
