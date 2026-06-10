#!/usr/bin/env bash
# NAS 构建 → 本机中转 → 云端 load（标准发版，避免 tag/上传错误）
# 用法: ./scripts/release-nas-to-cloud.sh
# 可选: YIQI_NAS_NO_CACHE=1  无缓存重建 NAS 镜像
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAS_HOST="${YIQI_NAS_HOST:-192.168.2.224}"
NAS_USER="${YIQI_NAS_USER:-Bely}"
NAS_KEY="${YIQI_NAS_SSH_KEY:-$HOME/.ssh/id_ed25519}"
CLOUD_HOST="${YIQI_CLOUD_HOST:-43.139.172.61}"
CLOUD_USER="${YIQI_CLOUD_USER:-ubuntu}"
CLOUD_KEY="${YIQI_CLOUD_SSH_KEY:-$HOME/.ssh/id_ed25519}"
NAS_TAR="${YIQI_NAS_TAR:-/home/Bely/docker-images/primordial-images.tar.gz}"
LOCAL_TAR="${YIQI_LOCAL_TAR:-/tmp/primordial-images.tar.gz}"
CLOUD_TAR="/opt/yiqi/images/primordial-images.tar.gz"

SSH_NAS=(ssh -i "$NAS_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "${NAS_USER}@${NAS_HOST}")
SCP_CLOUD=(scp -i "$CLOUD_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no)
SSH_CLOUD=(ssh -i "$CLOUD_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "${CLOUD_USER}@${CLOUD_HOST}")

log() { echo "[$(date '+%H:%M:%S')] $*"; }

[[ -f "$NAS_KEY" ]] || { echo "缺少 NAS 密钥 ${NAS_KEY}" >&2; exit 1; }
[[ -f "$CLOUD_KEY" ]] || { echo "缺少云密钥 ${CLOUD_KEY}" >&2; exit 1; }

log ">>> [1/4] NAS 拉代码 + 构建四服务"
[[ "${YIQI_NAS_NO_CACHE:-}" == "1" ]] && export YIQI_NAS_NO_CACHE=1
"${ROOT}/scripts/deploy-yiqi-nas.sh"

log ">>> [2/4] NAS 打 tag + 导出镜像包"
"${SSH_NAS[@]}" "bash -s" <<'NAS'
set -euo pipefail
COMPOSE_DIR="${YIQI_NAS_COMPOSE:-/home/Bely/docker-compose}"
OUT_DIR="${YIQI_EXPORT_DIR:-/home/Bely/docker-images}"
TAR="${OUT_DIR}/primordial-images.tar.gz"
cd "$COMPOSE_DIR"
declare -A TAGS=(
  [api-web]=primordial-api-web
  [api-admin]=primordial-api-admin
  [web-web]=primordial-web-web
  [web-admin]=primordial-web-admin
)
for svc in api-web api-admin web-web web-admin; do
  img=$(docker compose images -q "$svc" | head -1)
  [[ -n "$img" ]] || { echo "缺少镜像 $svc" >&2; exit 1; }
  docker tag "$img" "${TAGS[$svc]}:latest"
  echo "tagged ${TAGS[$svc]}:latest"
done
mkdir -p "$OUT_DIR"
docker save primordial-api-web:latest primordial-api-admin:latest primordial-web-web:latest primordial-web-admin:latest | gzip > "$TAR"
ls -lh "$TAR"
NAS

log ">>> [3/4] 本机中转上传到云"
"${SSH_NAS[@]}" "cat ${NAS_TAR}" > "$LOCAL_TAR"
ls -lh "$LOCAL_TAR"
"${SCP_CLOUD[@]}" "$LOCAL_TAR" "${CLOUD_USER}@${CLOUD_HOST}:${CLOUD_TAR}"
"${SSH_CLOUD[@]}" "bash /opt/yiqi/scripts/load-images.sh ${CLOUD_TAR}"

log ">>> [4/4] 校验云端"
"${SSH_CLOUD[@]}" "bash -s" <<'VERIFY'
set -euo pipefail
cd /opt/yiqi
echo "web image: $(docker inspect -f '{{.Image}}' primordial_web)"
docker exec primordial_web ls /usr/share/nginx/html/assets/
docker exec primordial_web sh -c 'grep -q TraitCardCarousel /usr/share/nginx/html/assets/*.js'
docker compose -f docker-compose.images.yml --env-file .env ps
echo VERIFY_OK
VERIFY

log ">>> 发版完成"
