#!/usr/bin/env bash
# 备份 MySQL 到 deploy/cloud/backups/（建议 cron 每日执行）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "${ROOT}/.env"

BACKUP_DIR="${ROOT}/backups"
STAMP=$(date +%Y%m%d_%H%M%S)
FILE="${BACKUP_DIR}/primordial_${STAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

docker exec primordial_mysql mysqldump \
  -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" \
  --single-transaction --routines --triggers \
  "${MYSQL_DATABASE}" | gzip > "$FILE"

chmod 600 "$FILE"
echo "备份完成: ${FILE}"
