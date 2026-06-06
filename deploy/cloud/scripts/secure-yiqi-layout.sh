#!/usr/bin/env bash
# 收紧 /opt/yiqi 敏感文件权限（SSH 登录后执行，无需停服务）
set -euo pipefail

YIQI_ROOT="${YIQI_ROOT:-/opt/yiqi}"
OWNER="${YIQI_OWNER:-ubuntu}"

[[ -d "$YIQI_ROOT" ]] || { echo "缺少 ${YIQI_ROOT}" >&2; exit 1; }

if [[ "$(id -u)" -eq 0 ]]; then
  chown -R "${OWNER}:${OWNER}" "$YIQI_ROOT"
fi

# 部署根目录：仅属主可进入，避免其他系统用户列举 .env
chmod 750 "$YIQI_ROOT"
chmod 600 "${YIQI_ROOT}/.env" 2>/dev/null || true

for d in secrets backups images mysql initdb-archive; do
  [[ -d "${YIQI_ROOT}/${d}" ]] && chmod 700 "${YIQI_ROOT}/${d}"
done

if [[ -d "${YIQI_ROOT}/secrets/keys" ]]; then
  chmod 700 "${YIQI_ROOT}/secrets/keys"
  chmod 600 "${YIQI_ROOT}/secrets/keys/"*.pem 2>/dev/null || true
fi

# 供脚本用的 MySQL 客户端配置（避免在 ps 中暴露 -p 参数）
MYCNF="${YIQI_ROOT}/secrets/.my.client.cnf"
if [[ -f "${YIQI_ROOT}/.env" ]]; then
  # shellcheck disable=SC1091
  set -a && source "${YIQI_ROOT}/.env" && set +a
  umask 077
  cat > "$MYCNF" <<EOF
[client]
host=127.0.0.1
port=3306
user=${MYSQL_USER}
password=${MYSQL_PASSWORD}
database=${MYSQL_DATABASE}
EOF
  chmod 600 "$MYCNF"
  chown "${OWNER}:${OWNER}" "$MYCNF" 2>/dev/null || true
fi

echo ">>> 权限已收紧: ${YIQI_ROOT}"
ls -ld "$YIQI_ROOT" "${YIQI_ROOT}/.env" "${YIQI_ROOT}/secrets" 2>/dev/null || true
[[ -f "$MYCNF" ]] && ls -l "$MYCNF"
