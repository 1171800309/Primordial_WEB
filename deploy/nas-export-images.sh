#!/usr/bin/env bash
# 在 NAS 上执行：构建四个业务镜像并导出，再 scp 到腾讯云（不在云端拉代码）
set -euo pipefail

COMPOSE_DIR="${YIQI_NAS_COMPOSE:-/home/Bely/docker-compose}"
OUT_DIR="${YIQI_EXPORT_DIR:-/home/Bely/docker-images}"
TAR="${OUT_DIR}/primordial-images.tar.gz"
CLOUD_HOST="${YIQI_CLOUD_HOST:-43.139.172.61}"
CLOUD_USER="${YIQI_CLOUD_USER:-ubuntu}"

mkdir -p "$OUT_DIR"

echo ">>> NAS 构建镜像"
cd "$COMPOSE_DIR"
docker compose build api-web api-admin web-web web-admin

echo ">>> 打标签（与云端 docker-compose.images.yml 一致）"
# compose 项目名可能是 primordial 或 primordial-cloud，统一导出为 primordial-*:latest
declare -A TAGS=(
  [api-web]=primordial-api-web
  [api-admin]=primordial-api-admin
  [web-web]=primordial-web-web
  [web-admin]=primordial-web-admin
)
for svc in api-web api-admin web-web web-admin; do
  img=$(docker compose images -q "$svc" 2>/dev/null | head -1)
  if [[ -z "$img" ]]; then
    echo "未找到服务 ${svc} 的构建镜像" >&2
    exit 1
  fi
  docker tag "$img" "${TAGS[$svc]}:latest"
  echo "tagged ${TAGS[$svc]}:latest <- ${img:0:12}"
done

echo ">>> 导出到 ${TAR}"
docker save primordial-api-web:latest primordial-api-admin:latest primordial-web-web:latest primordial-web-admin:latest | gzip > "$TAR"
ls -lh "$TAR"

SSH_KEY="${YIQI_CLOUD_SSH_KEY:-$HOME/.ssh/id_ed25519}"
SCP_OPTS=(-o StrictHostKeyChecking=no -o BatchMode=yes)
SSH_OPTS=(-o StrictHostKeyChecking=no -o BatchMode=yes)
if [[ -f "$SSH_KEY" ]]; then
  SCP_OPTS+=(-i "$SSH_KEY")
  SSH_OPTS+=(-i "$SSH_KEY")
fi
if [[ -f "$SSH_KEY" ]] && ssh "${SSH_OPTS[@]}" "${CLOUD_USER}@${CLOUD_HOST}" 'echo cloud_ok' 2>/dev/null; then
  echo ">>> 上传到云 ${CLOUD_USER}@${CLOUD_HOST}（SSH 密钥）"
  scp "${SCP_OPTS[@]}" "$TAR" "${CLOUD_USER}@${CLOUD_HOST}:/opt/yiqi/images/"
  ssh "${SSH_OPTS[@]}" "${CLOUD_USER}@${CLOUD_HOST}" "/opt/yiqi/scripts/load-images.sh /opt/yiqi/images/primordial-images.tar.gz"
else
  echo ">>> NAS 无法直连云（正常）。请在本机执行:"
  echo "    ./scripts/release-nas-to-cloud.sh"
  echo "或手动: ssh cat ${TAR} | scp … /opt/yiqi/images/ && load-images.sh"
fi
