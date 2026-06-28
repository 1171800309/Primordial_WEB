# Codex · 服务器连接配置（无密码版）

> 交给 Codex：仅使用 SSH 公钥，**不要**索取或写入 NAS/云/数据库密码。  
> 密码在各自服务器 `.env` 内，需时在对应机器上 `grep`，勿贴到聊天。

---

## 1. 本机 SSH（推荐）

```bash
# 安装配置
cp deploy/codex-ssh.config ~/.ssh/config
chmod 600 ~/.ssh/config
```

| 别名 | 命令 | 说明 |
|------|------|------|
| NAS | `ssh yiqi-nas` | 局域网，需先 `./scripts/setup-nas-ssh-key.sh` |
| 腾讯云 | `ssh yiqi-cloud` | 公网，仅密钥 |

私钥路径：`~/.ssh/id_ed25519`

---

## 2. NAS

| 项 | 值 |
|----|-----|
| Host | `yiqi-nas` / `192.168.2.224` |
| User | `Bely` |
| 认证 | 公钥 `~/.ssh/id_ed25519` |

```bash
ssh yiqi-nas
```

---

## 3. 腾讯云

| 项 | 值 |
|----|-----|
| Host | `yiqi-cloud` / `43.139.172.61` |
| User | `ubuntu` |
| 认证 | 公钥 `~/.ssh/id_ed25519` |
| 部署目录 | `/opt/yiqi` |

```bash
ssh yiqi-cloud
```

---

## 4. MySQL

### 云端（经 SSH 隧道，勿公网 3306）

```bash
ssh -N yiqi-cloud-mysql
# 或: ssh -N -L 3307:127.0.0.1:3306 yiqi-cloud
```

| 项 | 值 |
|----|-----|
| 主机 | `127.0.0.1` |
| 端口 | `3307`（隧道） |
| 用户 | `primordial` |
| 库 | `primordial_culture` |
| 密码 | `ssh yiqi-cloud "grep MYSQL_PASSWORD= /opt/yiqi/.env"` |

### NAS（局域网）

| 项 | 值 |
|----|-----|
| 主机 | `192.168.2.224` |
| 端口 | `3306` |
| 用户 | `root` |
| 库 | `primordial_culture` |
| 密码 | `ssh yiqi-nas "grep DB_CONNECTION= /home/Bely/docker-compose/.env"` |

---

## 5. 网站入口

| 环境 | 前台 | 管理 |
|------|------|------|
| NAS | `https://192.168.2.224:8001` | `http://192.168.2.224:8004` |
| 云（备案前） | `http://43.139.172.61:8001` | `http://43.139.172.61:8004` |
| 云（备案后） | `https://www.一炁.com` | `https://admin.一炁.com` |

---

## 6. 给 Codex 的固定话术

```text
SSH 仅密钥，配置见仓库 deploy/codex-ssh.config：
  NAS:   ssh yiqi-nas
  云:    ssh yiqi-cloud
  云库:  ssh -N yiqi-cloud-mysql 后连 127.0.0.1:3307
不要向我索要任何服务器或数据库密码。
```
