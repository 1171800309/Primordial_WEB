# 本地联调端口（已绑定）

## 端口一览

| 链路 | 后端 | 前端 | 前端 → 后端 |
|------|------|------|-------------|
| **用户前台** | `https://localhost:58725` | http://localhost:5173 | Vite 代理 `/api` → `https://127.0.0.1:58725` |
| **管理后台** | `http://localhost:5101` | http://localhost:5174 | Vite 代理 `/api` → `http://localhost:5101` |

前端请求一律走 **相对路径** `/api/...`（`VITE_API_BASE_URL` / `VITE_ADMIN_API_URL` 留空即可）。

## 开始测试（推荐）

### 用户前台

1. 打开 `Primordial_API` → F5 选 **「用户 API (web)」** → 等 Swagger 起来  
2. 打开 `Primordial_WEB/web` → 终端 `npm run dev`  
3. 浏览器访问 http://localhost:5173  

或打开 `Primordial.code-workspace` → F5 选 **「前台全栈（用户 API + 用户前台）」** 一次启动两条。

### 管理后台

1. `Primordial_API` → F5 **「管理 API (admin)」**  
2. `Primordial_WEB/admin` → `npm run dev`  
3. 访问 http://localhost:5174  

或工作区 F5：**「后台全栈（管理 API + 管理后台）」**。

## 首次联调前

数据库已迁到**云端 Docker**（MySQL 不暴露公网）。本地调试需 **SSH 隧道** + 同步连接配置：

```bash
# 1. 从云端 /opt/yiqi/.env 写入 appsettings.Development.json（已在 .gitignore）
cd Primordial_API
./scripts/setup-dev-db-from-cloud.sh

# 2. 建立 SSH 隧道（保持此终端运行）
./scripts/cloud-db-tunnel.sh
# 等价：ssh -N -L 127.0.0.1:3306:127.0.0.1:3306 ubuntu@43.139.172.61

# 3. 另开终端启动 API / 前台
```

连接串为 `127.0.0.1:3306`、账号 `primordial`（与云端一致）。若本地 3306 被占用，可 `YIQI_LOCAL_MYSQL_PORT=13306 ./scripts/cloud-db-tunnel.sh` 并重新跑 setup 脚本。

旧 NAS 局域网库（192.168.2.224）已不再用于本地默认配置。

管理端 init-admin 密码（在用户 API 上调用）：

```http
POST https://localhost:58725/api/auth/init-admin-password
```

## 快速自检

| 检查项 | URL |
|--------|-----|
| 用户 API 存活 | https://localhost:58725/swagger |
| 管理 API 存活 | http://localhost:5101/swagger |
| 前台页面 | http://localhost:5173 |
| 后台页面 | http://localhost:5174 |
