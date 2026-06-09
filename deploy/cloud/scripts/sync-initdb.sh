#!/usr/bin/env bash
# 将 API 仓库中的 SQL 迁移脚本同步到 initdb（仅文件名排序，重复执行需手动迁移）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env"
if [[ ! -f "$ENV_FILE" ]] && [[ -f "${YIQI_ROOT:-/opt/yiqi}/.env" ]]; then
  ENV_FILE="${YIQI_ROOT:-/opt/yiqi}/.env"
fi
# shellcheck disable=SC1091
source "$ENV_FILE"

SQL_SRC="${PRIMORDIAL_API_ROOT}/web/database/mysql"
INIT="${ROOT}/initdb"

mkdir -p "$INIT"
find "$INIT" -maxdepth 1 -name '*.sql' -delete 2>/dev/null || true

if [[ ! -d "$SQL_SRC" ]]; then
  echo "未找到 ${SQL_SRC}，跳过 initdb 同步" >&2
  exit 0
fi

n=0
for f in "$SQL_SRC"/*.sql; do
  [[ -f "$f" ]] || continue
  base=$(basename "$f")
  cp -f "$f" "${INIT}/${base}"
  n=$((n + 1))
done
echo "已同步 ${n} 个 SQL 到 initdb/（仅 MySQL 首次初始化容器时自动执行）"
