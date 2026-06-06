#!/usr/bin/env bash
# 云服务器上一键发版（拉代码 → 覆盖 nginx → 构建 → 启动）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "缺少 .env，请先运行: ./scripts/gen-secrets.sh 并编辑域名" >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a && source .env && set +a

for v in SITE_DOMAIN ADMIN_DOMAIN ACME_EMAIL MYSQL_PASSWORD JWT_SECRET_WEB JWT_SECRET_ADMIN PRIMORDIAL_WEB_ROOT PRIMORDIAL_API_ROOT; do
  if [[ -z "${!v:-}" ]]; then
    echo "环境变量 ${v} 未设置，请检查 .env" >&2
    exit 1
  fi
done

if [[ ! -d "${PRIMORDIAL_WEB_ROOT}/.git" ]] || [[ ! -d "${PRIMORDIAL_API_ROOT}/.git" ]]; then
  echo "代码目录不存在，请先运行 setup-server.sh 或手动 clone 仓库" >&2
  exit 1
fi

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

pull_repo() {
  local dir=$1 name=$2
  log "拉取 ${name} …"
  cd "$dir"
  git fetch origin
  git checkout "${GIT_BRANCH:-main}"
  git reset --hard "origin/${GIT_BRANCH:-main}"
  git log -1 --oneline
}

pull_repo "$PRIMORDIAL_API_ROOT" "Primordial_API"
pull_repo "$PRIMORDIAL_WEB_ROOT" "Primordial_WEB"

bash "${ROOT}/scripts/apply-overlay.sh"
bash "${ROOT}/scripts/sync-initdb.sh"

BUILD_OPTS=()
if [[ "${YIQI_NO_CACHE:-0}" == "1" ]]; then
  BUILD_OPTS+=(--no-cache)
  log "Docker 构建（无缓存）"
else
  log "Docker 构建"
fi

cd "$ROOT"
docker compose --env-file .env build "${BUILD_OPTS[@]}"
docker compose --env-file .env up -d

log "服务状态"
docker compose --env-file .env ps

log "完成。用户站 https://${SITE_DOMAIN}  管理后台 https://${ADMIN_DOMAIN}"
