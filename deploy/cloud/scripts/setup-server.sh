#!/usr/bin/env bash
# 在云服务器首次执行（Ubuntu 22.04/24.04）。需 root 或 sudo。
set -euo pipefail

INSTALL_DIR="${YIQI_INSTALL_DIR:-/opt/yiqi}"
WEB_REPO="${YIQI_WEB_REPO:-https://github.com/1171800309/Primordial_WEB.git}"
API_REPO="${YIQI_API_REPO:-https://github.com/1171800309/Primordial_API.git}"
DEPLOY_USER="${YIQI_DEPLOY_USER:-$USER}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "请使用 sudo 运行此脚本" >&2
  exit 1
fi

echo ">>> 安装 Docker"
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

echo ">>> 将 ${DEPLOY_USER} 加入 docker 组"
usermod -aG docker "$DEPLOY_USER" 2>/dev/null || true

echo ">>> 配置防火墙 UFW"
if command -v ufw >/dev/null 2>&1; then
  ufw --force reset
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable
fi

echo ">>> 创建目录 ${INSTALL_DIR}"
mkdir -p "$INSTALL_DIR"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "$INSTALL_DIR"

sudo -u "$DEPLOY_USER" bash <<EOSU
set -euo pipefail
cd "${INSTALL_DIR}"

if [[ ! -d Primordial_WEB/.git ]]; then
  git clone "${WEB_REPO}" Primordial_WEB
fi
if [[ ! -d Primordial_API/.git ]]; then
  git clone "${API_REPO}" Primordial_API
fi

# 部署包使用仓库内 deploy/cloud
CLOUD="\${PWD}/Primordial_WEB/deploy/cloud"
cd "\$CLOUD"
chmod +x scripts/*.sh
./scripts/gen-secrets.sh

# 写入代码路径
sed -i "s|^PRIMORDIAL_WEB_ROOT=.*|PRIMORDIAL_WEB_ROOT=${INSTALL_DIR}/Primordial_WEB|" .env
sed -i "s|^PRIMORDIAL_API_ROOT=.*|PRIMORDIAL_API_ROOT=${INSTALL_DIR}/Primordial_API|" .env

echo ""
echo "=========================================="
echo "首次安装下一步（必做）："
echo "1. 编辑 \${CLOUD}/.env"
echo "   - SITE_DOMAIN / ADMIN_DOMAIN（已解析到本机公网 IP）"
echo "   - ACME_EMAIL（Let's Encrypt）"
echo "2. 执行发版: cd \${CLOUD} && ./scripts/deploy.sh"
echo "=========================================="
EOSU

echo ">>> setup-server 完成"
