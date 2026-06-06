# NAS 构建 → 腾讯云一站式部署

## 云服务器

| 项 | 值 |
|----|-----|
| IP | `43.139.172.61` |
| 用户 | `ubuntu`（仅 SSH 公钥） |
| 目录 | `/opt/yiqi` |
| 编排 | `docker-compose.images.yml`（只用镜像，不 build、不 git pull） |

## 发布包内容（`yiqi-cloud-release.tar.gz`）

| 路径 | 说明 |
|------|------|
| `images/primordial-images.tar.gz` | 四业务镜像：api-web、api-admin、web-web、web-admin |
| `mysql/primordial_culture.dump.gz` | NAS 全库 mysqldump（约 46 张表） |
| `config/initdb/*.sql` | 001–009 归档用，**首次上云不跑 initdb** |
| `config/docker-compose.images.yml` | 编排 |
| `config/Caddyfile` | HTTPS 反代 |
| `config/scripts/*.sh` | 安装、导入、测库等 |

## 在 NAS 上打发布包

```bash
# 1. 构建四服务（若镜像已过期）
cd /home/Bely/docker-compose
docker compose build api-web api-admin web-web web-admin
# 按 nas-export-images.sh 打 tag 并导出到 yiqi-cloud-release/images/

# 2. 一键打包（含 MySQL 导出 + 配置脚本）
bash /home/Bely/code/Primordial_WEB/deploy/nas-pack-cloud-release.sh
# 产物: /home/Bely/yiqi-cloud-release.tar.gz
```

Synology 上若 `scp` 拉不动文件，可用 `ssh cat` 中转（本机已验证）：

```bash
ssh Bely@NAS "cat /home/Bely/yiqi-cloud-release.tar.gz" > /tmp/yiqi-cloud-release.tar.gz
scp -i ~/.ssh/id_ed25519 /tmp/yiqi-cloud-release.tar.gz ubuntu@43.139.172.61:/opt/yiqi/
```

## 云端一步到位安装

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@43.139.172.61

# 首次：编辑域名与 ACME 邮箱（密钥已在 /opt/yiqi/.env）
nano /opt/yiqi/.env   # SITE_DOMAIN、ADMIN_DOMAIN、ACME_EMAIL

# 安装（加载镜像 → 启 MySQL → 导入 dump → 启全栈）
bash /opt/yiqi/scripts/install-release.sh /opt/yiqi/yiqi-cloud-release.tar.gz
```

可选自动上传（在能 ssh 到云的机器上，且 NAS 有私钥）：

```bash
YIQI_UPLOAD=1 YIQI_CLOUD_SSH_KEY=~/.ssh/id_ed25519 bash nas-pack-cloud-release.sh
```

**腾讯云安全组**：22（建议限 IP）、80、443。

## 如何测试数据库是否正常

在云端执行：

```bash
bash /opt/yiqi/scripts/test-db.sh
```

脚本会检查：

1. 容器 `primordial_mysql` 在运行  
2. `mysqladmin ping`（root）  
3. 应用账号 `${MYSQL_USER}` 能 `SELECT 1`  
4. `primordial_culture` 表数量 ≥ 40（NAS 约 **46**）  
5. `primordial_api_web` 无 obvious 连库错误  

手动抽查（不打印密码时可先 `source /opt/yiqi/.env`）：

```bash
cd /opt/yiqi
set -a && source .env && set +a

docker compose -f docker-compose.images.yml --env-file .env exec -T mysql \
  mysqladmin ping -h 127.0.0.1 -uroot -p"${MYSQL_ROOT_PASSWORD}"

docker compose -f docker-compose.images.yml --env-file .env exec -T mysql \
  mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" -N -e \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${MYSQL_DATABASE}';"
```

期望输出表数量 **46**。

仅重导数据库（不重启全栈）：

```bash
bash /opt/yiqi/scripts/import-mysql.sh /opt/yiqi/mysql/primordial_culture.dump.gz
```

## 无域名时用 IP + 端口（与 NAS 一致）

| 站点 | 地址 |
|------|------|
| **前台（用户站）** | `http://43.139.172.61:8001` |
| **管理后台** | `http://43.139.172.61:8004` |

腾讯云**安全组**需放行 `8001`、`8004`（及 22）。服务器 UFW 已放行。

Caddy（80/443）已改为 `domain` profile，暂不上线域名时不启动：  
`docker compose -f docker-compose.images.yml --profile domain up -d caddy`

## 上线后（域名）

- 域名解析到 `43.139.172.61` 后，启用 Caddy profile 并配置 `.env`  
- 用户站：`https://${SITE_DOMAIN}`  
- 管理后台：`https://${ADMIN_DOMAIN}`  
- 密钥与 `.env` 勿提交 Git，见 `SECURITY.md`

## 当前状态（2026-06-04）

- 发布包已上传并执行 `install-release.sh`  
- MySQL 导入校验：**46** 张表  
- 六容器已启动：mysql、api-web、api-admin、web-web、web-admin、caddy  
