#!/usr/bin/env bash
# 加载 NAS 传来的镜像包并启动（在 /opt/yiqi 目录）
set -euo pipefail

ROOT="${YIQI_ROOT:-/opt/yiqi}"
TAR="${1:-${ROOT}/images/primordial-images.tar.gz}"

if [[ ! -f "$TAR" ]]; then
  echo "找不到镜像包: ${TAR}" >&2
  echo "请先从 NAS 上传 primordial-images.tar.gz 到 ${ROOT}/images/" >&2
  exit 1
fi

echo ">>> 加载镜像 ${TAR}"
gunzip -c "$TAR" | docker load

echo ">>> 当前 primordial 镜像"
docker images | grep -E 'primordial|REPOSITORY' || true

if [[ -f "${ROOT}/.env" ]]; then
  cd "$ROOT"
  docker compose -f docker-compose.images.yml --env-file .env up -d --force-recreate api-web admin-api web-web web-admin
  docker compose -f docker-compose.images.yml ps
  echo ">>> 已启动。请确认 .env 中域名与 DNS 已配置。"
else
  echo ">>> 镜像已加载。请配置 ${ROOT}/.env 后执行:"
  echo "    cd ${ROOT} && docker compose -f docker-compose.images.yml --env-file .env up -d"
fi
