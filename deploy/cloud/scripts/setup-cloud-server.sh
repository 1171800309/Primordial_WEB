#!/usr/bin/env bash
# 腾讯云前期准备：装 Docker、防火墙、目录（不 clone 代码、不 build）
set -euo pipefail

INSTALL_DIR="${YIQI_INSTALL_DIR:-/opt/yiqi}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "请 sudo 运行" >&2
  exit 1
fi

echo ">>> 安装 Docker"
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y docker.io docker-compose-v2
  systemctl enable --now docker
fi

if [[ ! -f /etc/docker/daemon.json ]]; then
  mkdir -p /etc/docker
  cat > /etc/docker/daemon.json << 'JSON'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.m.daocloud.io"
  ]
}
JSON
  systemctl restart docker
fi

DEPLOY_USER="${SUDO_USER:-ubuntu}"
usermod -aG docker "$DEPLOY_USER" 2>/dev/null || true

echo ">>> UFW"
if command -v ufw >/dev/null 2>&1; then
  ufw --force reset
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable
fi

echo ">>> 目录 ${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}"/{images,initdb,secrets/keys,backups}
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${INSTALL_DIR}"
chmod 700 "${INSTALL_DIR}/secrets" "${INSTALL_DIR}/secrets/keys"

echo ">>> 预拉公共镜像"
docker pull mysql:8.0
docker pull caddy:2-alpine

echo ">>> 完成。请将 NAS 导出的 primordial-images.tar.gz 放到 ${INSTALL_DIR}/images/ 后执行 load-images.sh"
