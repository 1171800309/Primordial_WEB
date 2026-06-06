# 一炁文化 · 云服务器部署

目标：**一条命令发版** + **生产级安全默认**（HTTPS、密钥不进 Git、MySQL 不暴露公网、密码 RSA 传输）。

## 架构

```
Internet → Caddy (:443 自动证书)
            ├─ SITE_DOMAIN      → web-web (Vue)
            └─ ADMIN_DOMAIN     → web-admin (React)
         内网 only:
            api-web / admin-api → MySQL
```

## 一、首次安装（云服务器上执行一次）

要求：Ubuntu 22.04/24.04、2GB+ 内存、域名已 **A 记录** 到服务器公网 IP。

```bash
# 上传或 git clone Primordial_WEB 后：
cd Primordial_WEB/deploy/cloud
sudo bash scripts/setup-server.sh
```

然后编辑 `.env`（**必改**）：

```bash
nano .env
# SITE_DOMAIN=www.你的域名.com
# ADMIN_DOMAIN=admin.你的域名.com
# ACME_EMAIL=你的邮箱@example.com
```

首次发版：

```bash
./scripts/deploy.sh
```

浏览器访问：

- 用户站：`https://SITE_DOMAIN`
- 管理后台：`https://ADMIN_DOMAIN`

## 二、日常发版（最简）

**在服务器上：**

```bash
cd /opt/yiqi/Primordial_WEB/deploy/cloud
./scripts/deploy.sh
```

**在你本机（已配置 SSH 密钥）：**

```bash
export YIQI_CLOUD_HOST=你的服务器IP
export YIQI_CLOUD_USER=ubuntu
./scripts/deploy-yiqi-cloud.sh
```

无缓存重建：`YIQI_NO_CACHE=1 ./scripts/deploy.sh`

## 三、安全清单（已内置 + 请你配合）

| 项 | 做法 |
|----|------|
| HTTPS | Caddy + Let's Encrypt，强制 HSTS |
| 密钥 | `gen-secrets.sh` 生成 JWT/MySQL/RSA，`.env` chmod 600，不入 Git |
| 数据库 | 仅 Docker 内网 `mysql:3306`，**无**宿主机 3306 映射 |
| 应用账号 | 使用 `MYSQL_USER=primordial`，非 root |
| 登录密码 | `RequireEncryptedTransport=true`，须 HTTPS |
| 防火墙 | `setup-server.sh` 仅开放 22/80/443 |
| SSH | 建议禁用密码登录，仅用密钥；勿把私钥提交仓库 |
| 备份 | 定期备份 Docker 卷 `mysql_data` 与 `secrets/keys` |

### 建议你额外完成

1. 云厂商安全组：只放行 **22、80、443**（22 可限制为你的办公 IP）。
2. `ssh` 使用密钥：`PasswordAuthentication no`。
3. 数据库备份：`./scripts/backup-mysql.sh`（可加入 crontab 每日执行）。
4. 已有 NAS 数据迁移：在服务器导入 dump 后执行未跑过的 `database/mysql/*.sql`。

## 四、文件说明

| 文件 | 作用 |
|------|------|
| `docker-compose.yml` | 全栈编排 |
| `.env` | 域名与密钥（本地生成，勿提交） |
| `Caddyfile` | 双域名 HTTPS 反代 |
| `nginx/web.conf` | 用户站 `/api` 反代 |
| `scripts/deploy.sh` | 拉代码 + 构建 + 启动 |
| `scripts/gen-secrets.sh` | 首次生成密钥 |
| `initdb/` | MySQL 首次初始化 SQL（由 sync-initdb 同步） |

## 五、故障排查

| 现象 | 处理 |
|------|------|
| 证书申请失败 | 确认域名 DNS 已生效、`ACME_EMAIL` 正确、80/443 已放行 |
| 管理后台无法登录 | 必须用 `https://ADMIN_DOMAIN`；检查 `secrets/keys` 是否存在 |
| API 502 | `docker compose logs api-web api-admin` |
| 数据库连接失败 | `docker compose logs mysql`，检查 `.env` 密码 |

## 六、与 NAS 的区别

| | NAS | 云 |
|--|-----|-----|
| HTTPS | 自签名 / 多端口 | Caddy 正式证书 |
| MySQL | 已有 mysql-1 |  compose 内新建 |
| 发版 | `/home/Bely/deploy.sh` | `deploy/cloud/scripts/deploy.sh` |

NAS 发版脚本保留不变；云使用本目录独立流程。
