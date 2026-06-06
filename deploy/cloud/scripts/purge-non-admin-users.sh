#!/usr/bin/env bash
# 备份后删除除 admin（user_type=admin）外的全部用户及关联数据
set -euo pipefail

YIQI_ROOT="${YIQI_ROOT:-/opt/yiqi}"
COMPOSE_FILE="${YIQI_ROOT}/docker-compose.images.yml"
SQL="${YIQI_ROOT}/scripts/purge-non-admin-users.sql"
STAMP=$(date +%Y%m%d_%H%M%S)
BACKUP="${YIQI_ROOT}/backups/before_purge_users_${STAMP}.sql.gz"

# shellcheck disable=SC1091
set -a && source "${YIQI_ROOT}/.env" && set +a

[[ -f "$SQL" ]] || { echo "缺少 ${SQL}" >&2; exit 1; }

mkdir -p "${YIQI_ROOT}/backups"

echo ">>> 备份全库到 ${BACKUP}"
docker compose -f "$COMPOSE_FILE" --env-file "${YIQI_ROOT}/.env" exec -T mysql \
  mysqldump -uroot -p"${MYSQL_ROOT_PASSWORD}" --single-transaction \
  --routines --triggers "${MYSQL_DATABASE}" | gzip > "$BACKUP"
ls -lh "$BACKUP"

admin_id=$(docker compose -f "$COMPOSE_FILE" --env-file "${YIQI_ROOT}/.env" exec -T mysql \
  mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" -N -e \
  "SELECT id FROM ${MYSQL_DATABASE}.users WHERE user_type='admin' ORDER BY id LIMIT 1;" 2>/dev/null)
[[ -n "${admin_id}" ]] || { echo "未找到 user_type=admin 的账号，已中止" >&2; exit 1; }
echo "保留 admin 用户 id=${admin_id}"

echo ">>> 清理非 admin 用户"
docker compose -f "$COMPOSE_FILE" --env-file "${YIQI_ROOT}/.env" exec -T mysql \
  mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}" < "$SQL"

echo ">>> 完成"
