# Primordial 前端 Monorepo

与 `Primordial_API` 对称：**`web/`** + **`admin/`**。

## 命名对照

| 仓库 | 用户端 | 管理端 |
|------|--------|--------|
| Primordial_WEB | `web/` Vue 前台 | `admin/` React 后台 |
| Primordial_API | `web/` 用户 API | `admin/` 管理 API |

## 本地开发

```bash
# 后端
cd ../Primordial_API/web/src/Primordial.Api && dotnet run      # F5 或 :58725
cd ../Primordial_API/admin/src/Primordial.Admin.Api && dotnet run  # :5101

# 前端
cd web && npm run dev    # :5173
cd admin && npm run dev  # :5174 → 代理 :5101
```

详见各包 `README.md` 与 **[DEBUG.md](DEBUG.md)**（联调端口与 F5 启动顺序）。

## NAS 发版（一炁文化生产）

在对话中说「发布一炁文化」时，Agent 会 SSH 到 NAS 执行 `/home/Bely/deploy.sh`（拉代码 + 构建四个 Docker 服务并重启）。

本机手动触发（密码用环境变量，勿提交 Git）：

```bash
YIQI_NAS_SSH_PASS='你的密码' ./scripts/deploy-yiqi-nas.sh
```

无缓存重建：`YIQI_NAS_NO_CACHE=1 YIQI_NAS_SSH_PASS='…' ./scripts/deploy-yiqi-nas.sh`

### 访问地址（勿混用）

| 端 | 地址 | 说明 |
|----|------|------|
| **管理后台（推荐）** | `https://192.168.2.224:8443` | React 管理后台 HTTPS |
| **管理后台 HTTP** | `http://192.168.2.224:8004` | 自动跳转到 `https://…:8443`（勿对 8004 用 https，会报 400） |
| **用户前台** | `https://192.168.2.224:8001` | Vue 用户站；`/login` 是用户登录，不是管理后台 |
| **主机 Nginx** | `http://admin.primordial.local`（需 hosts） | 见 `deploy/nas-nginx-admin.conf` |

NAS 上 `docker-compose` 的 `VITE_*` 必须写在 **`build.args`**，写在 `environment` 不会打进前端包。

## 云服务器部署（生产）

完整方案见 **[deploy/cloud/README.md](deploy/cloud/README.md)**（Caddy 自动 HTTPS、MySQL 内网、密钥自动生成、UFW）。

```bash
# 云服务器首次
sudo bash deploy/cloud/scripts/setup-server.sh
nano deploy/cloud/.env   # 填域名与邮箱
./deploy/cloud/scripts/deploy.sh

# 本机一键云发版（SSH 密钥）
YIQI_CLOUD_HOST=你的IP ./scripts/deploy-yiqi-cloud.sh
```
