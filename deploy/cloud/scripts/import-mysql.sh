#!/usr/bin/env bash
# 将 NAS 导出的 primordial_culture.dump.gz 导入云端 MySQL
set -euo pipefail

YIQI_ROOT="${YIQI_ROOT:-/opt/yiqi}"
DUMP="${1:-${YIQI_ROOT}/mysql/primordial_culture.dump.gz}"
COMPOSE_FILE="${YIQI_ROOT}/docker-compose.images.yml"

# shellcheck disable=SC1091
set -a && source "${YIQI_ROOT}/.env" && set +a

[[ -f "$DUMP" ]] || { echo "找不到 ${DUMP}" >&2; exit 1; }

echo ">>> 导入 ${DUMP}（可能需要 1～3 分钟）"
gunzip -c "$DUMP" | docker compose -f "$COMPOSE_FILE" --env-file "${YIQI_ROOT}/.env" exec -T mysql \
  mysql -uroot -p"${MYSQL_ROOT_PASSWORD}"

echo ">>> 校验表数量"
docker compose -f "$COMPOSE_FILE" --env-file "${YIQI_ROOT}/.env" exec -T mysql \
  mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -N -e \
  "SELECT COUNT(*) AS tables_count FROM information_schema.tables WHERE table_schema='${MYSQL_DATABASE}';"

echo ">>> 导入完成"
