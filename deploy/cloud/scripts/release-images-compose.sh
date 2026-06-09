#!/usr/bin/env bash
# 云端发版：构建 primordial-cloud-* → retag 为 primordial-* → 用 images compose 重启
set -euo pipefail

YIQI_ROOT="${YIQI_ROOT:-/opt/yiqi}"
WEB_ROOT="${PRIMORDIAL_WEB_ROOT:-${YIQI_ROOT}/Primordial_WEB}"
BUILD_COMPOSE="${WEB_ROOT}/deploy/cloud/docker-compose.yml"
RUN_COMPOSE="${YIQI_ROOT}/docker-compose.images.yml"
ENV_FILE="${YIQI_ROOT}/.env"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

[[ -f "$ENV_FILE" ]] || { echo "缺少 ${ENV_FILE}" >&2; exit 1; }

log "Docker 构建四服务"
docker compose -f "$BUILD_COMPOSE" --env-file "$ENV_FILE" build api-web admin-api web-web web-admin

log "Retag 运行时镜像"
bash "${SCRIPT_DIR}/tag-runtime-images.sh"

log "重启四服务"
docker compose -f "$RUN_COMPOSE" --env-file "$ENV_FILE" up -d --force-recreate api-web admin-api web-web web-admin
docker compose -f "$RUN_COMPOSE" --env-file "$ENV_FILE" ps

log "完成"
