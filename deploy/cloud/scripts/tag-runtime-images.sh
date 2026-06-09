#!/usr/bin/env bash
# docker-compose.yml 构建产出 primordial-cloud-* 镜像；
# docker-compose.images.yml 运行时使用 primordial-* 镜像名，发布前必须 retag。
set -euo pipefail

declare -A MAP=(
  [primordial-cloud-api-web]=primordial-api-web
  [primordial-cloud-admin-api]=primordial-api-admin
  [primordial-cloud-web-web]=primordial-web-web
  [primordial-cloud-web-admin]=primordial-web-admin
)

for src in "${!MAP[@]}"; do
  dst="${MAP[$src]}:latest"
  if ! docker image inspect "${src}:latest" >/dev/null 2>&1; then
    echo "缺少构建镜像 ${src}:latest" >&2
    exit 1
  fi
  docker tag "${src}:latest" "$dst"
  echo "tagged ${src}:latest -> ${dst}"
done
