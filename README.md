# Primordial 前端 Monorepo

用户前台与管理后台分离在同一仓库，便于统一版本管理与 CI。

## 目录结构

```
Primordial_WEB/
├── web/          # 用户前台（Vue 3 + Vite）
├── admin/        # 管理后台（React + Vite）
├── temps/        # 原型 HTML（不参与构建）
├── docker-compose.yml
└── package.json  # 根脚本（转发到子项目）
```

## 本地开发

```bash
# 安装依赖（分别在子目录执行一次）
cd web && npm install && cd ..
cd admin && npm install && cd ..

# 用户前台 — http://localhost:5173（端口占用时自动递增）
npm run dev:web

# 管理后台 — http://localhost:5174
npm run dev:admin
```

开发时 API 通过 Vite 代理转发：

| 子项目 | 代理前缀 | 默认后端 |
|--------|----------|----------|
| web | `/api` | 用户 API `http://localhost:5100`（见 `web/.env` 中 `VITE_API_PROXY_TARGET`） |
| admin | `/api` | 管理 API `http://localhost:5101` |

## 构建

```bash
npm run build        # 仅 web
npm run build:admin  # 仅 admin
npm run build:all    # 两者
```

## Docker

各子项目独立镜像，互不影响：

```bash
# 分别构建
npm run docker:web
npm run docker:admin

# 或一键 compose（默认 web:8080, admin:8081）
docker compose up --build
```

构建时可传入 API 地址（写入静态资源）：

```bash
docker build -t primordial-web ./web \
  --build-arg VITE_API_BASE_URL=https://api.example.com

docker build -t primordial-admin ./admin \
  --build-arg VITE_ADMIN_API_URL=https://admin-api.example.com
```

## 环境变量

| 文件 | 说明 |
|------|------|
| `web/.env.example` | 用户前台 Vite 变量 |
| `admin/.env.example` | 管理后台 Vite 变量 |

复制为 `.env` 后按需修改；`.env` 已加入 `.gitignore`。

## 后端仓库

API 见独立仓库 [Primordial_API](https://github.com/1171800309/Primordial_API)：

- `api/` — 用户端 API
- `admin-api/` — 管理端 API
