# 一炁文化 · 云服务器安全说明

## 已在 `43.139.172.61` 执行的措施

| 措施 | 说明 |
|------|------|
| SSH 公钥 | 你本机 `~/.ssh/id_ed25519.pub` 已加入 `ubuntu` 用户 |
| 禁止密码 SSH | 仅允许公钥；`AuthenticationMethods publickey` |
| 禁止 root SSH | `PermitRootLogin no` |
| fail2ban | SSH 失败 3 次封禁 24 小时 |
| UFW | 仅 22 / 80 / 443 |
| 密钥轮换 | `/opt/yiqi/.env`、RSA 已重新生成（聊天泄露后） |
| 目录权限 | `/opt/yiqi` `750`，`.env`/`.my.client.cnf` `600`，`secrets/` `700` |
| 自动安全更新 | `unattended-upgrades` 已安装 |

## 你必须在腾讯云控制台完成

1. **修改 CVM 登录密码**（原密码已在对话中出现，视为泄露）。
2. **安全组**：22 端口建议仅允许你的办公/家庭公网 IP，不要 `0.0.0.0/0`。
3. **域名与 HTTPS**：编辑 `/opt/yiqi/.env` 中的 `SITE_DOMAIN`、`ADMIN_DOMAIN`、`ACME_EMAIL`。

## 本机登录方式（之后不要用密码 SSH）

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@43.139.172.61
```

可在 `~/.ssh/config` 添加：

```
Host yiqi-cloud
  HostName 43.139.172.61
  User ubuntu
  IdentityFile ~/.ssh/id_ed25519
```

## 发版脚本勿再使用密码

`deploy-yiqi-cloud.sh` / `nas-export-images.sh` 请改用密钥：

```bash
export YIQI_CLOUD_SSH_KEY=~/.ssh/id_ed25519
# 勿再设置 YIQI_CLOUD_SSH_PASS
```

## 维护命令（SSH 登录后）

```bash
# 再次轮换密钥（泄漏时）
sudo /opt/yiqi/scripts/rotate-secrets.sh

# 查看封禁 IP
sudo fail2ban-client status sshd

# MySQL 备份
/opt/yiqi/scripts/backup-mysql.sh
```

## 连库密码放在哪、是否安全

| 位置 | 云端 | 说明 |
|------|------|------|
| `/opt/yiqi/.env` | ✅ | `chmod 600`，仅 `ubuntu` 可读；Compose 用 `${MYSQL_*}` 注入，**不要**提交 Git |
| `docker-compose.images.yml` | ✅ | 只有 `${变量}`，无明文密码 |
| `docker inspect` 环境变量 | ⚠️ | 有服务器 SSH 权限的人可见，单租户 VPS 可接受 |
| MySQL 3306 | ✅ | 仅 `127.0.0.1`，需 SSH 隧道（Navicat） |
| 仓库脚本 | ✅ | 已去掉 `Make@2026` 等默认密码；NAS 打包需 `YIQI_MYSQL_ROOT_PASS` 环境变量 |

**已执行加固**：`secure-yiqi-layout.sh`（权限 + `secrets/.my.client.cnf` 供脚本连库，减少命令行 `-p` 泄露）。

**若密码曾在聊天/截图中泄露**：云端执行（会断开 Navicat 直至改新密码）：

```bash
sudo bash /opt/yiqi/scripts/rotate-secrets-live.sh
```

## NAS

- 非 admin 用户已清理；备份：`/home/Bely/backups/before_purge_users_*.sql.gz`
- 数据库密码已迁至 `/home/Bely/docker-compose/.env`（`600`），`nas-prod` 的 `appsettings.json` 不再写明文
- API 通过 `env_file` + `ConnectionStrings__DefaultConnection` 读 `.env`
- **建议**：修改 MySQL `root` 密码后同步更新 `.env` 中 `DB_CONNECTION`；NAS SSH 改用密钥，勿把 `YIQI_NAS_SSH_PASS` 写入仓库
