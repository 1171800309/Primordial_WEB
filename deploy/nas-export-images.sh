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

echo ">>> 打标签（与云端 compose 一致）"
docker tag primordial-api-web:latest primordial-api-web:latest 2>/dev/null || docker tag "$(docker compose images -q api-web)" primordial-api-web:latest
docker tag primordial-api-admin:latest primordial-api-admin:latest 2>/dev/null || docker tag "$(docker compose images -q api-admin)" primordial-api-admin:latest
docker tag primordial-web-web:latest primordial-web-web:latest 2>/dev/null || docker tag "$(docker compose images -q web-web)" primordial-web-web:latest
docker tag primordial-web-admin:latest primordial-web-admin:latest 2>/dev/null || docker tag "$(docker compose images -q web-admin)" primordial-web-admin:latest

# 以 compose 项目名 primordial 为准
for pair in "api-web:primordial-api-web" "api-admin:primordial-api-admin" "web-web:primordial-web-web" "web-admin:primordial-web-admin"; do
  svc="${pair%%:*}"
  tag="${pair##*:}"
  img=$(docker compose images -q "$svc" 2>/dev/null | head -1)
  if [[ -n "$img" ]]; then
    docker tag "$img" "${tag}:latest"
  fi
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
  echo ">>> 上传到云 ${CLOUD_USER}@${CLOUD_HOST}（SSH 密钥）"
  scp "${SCP_OPTS[@]}" "$TAR" "${CLOUD_USER}@${CLOUD_HOST}:/opt/yiqi/images/"
  ssh "${SSH_OPTS[@]}" "${CLOUD_USER}@${CLOUD_HOST}" "/opt/yiqi/scripts/load-images.sh /opt/yiqi/images/primordial-images.tar.gz"
else
  echo ">>> 请配置 YIQI_CLOUD_SSH_KEY 后重试，或手动上传:"
  echo "scp -i ~/.ssh/id_ed25519 ${TAR} ${CLOUD_USER}@${CLOUD_HOST}:/opt/yiqi/images/"
  echo "ssh -i ~/.ssh/id_ed25519 ${CLOUD_USER}@${CLOUD_HOST} /opt/yiqi/scripts/load-images.sh"
fi
