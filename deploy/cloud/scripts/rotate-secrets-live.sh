#!/usr/bin/env bash
# 轮换 .env 中的 MySQL/JWT/RSA，并在运行中的 MySQL 内同步 ALTER USER（需 SSH 到云服务器执行）
set -euo pipefail

ROOT="${YIQI_ROOT:-/opt/yiqi}"
ENV="${ROOT}/.env"
KEY_DIR="${ROOT}/secrets/keys"
COMPOSE_FILE="${ROOT}/docker-compose.images.yml"

rand() { openssl rand -hex 32; }

[[ -f "$ENV" ]] || { echo "缺少 ${ENV}" >&2; exit 1; }

# shellcheck disable=SC1091
set -a && source "$ENV" && set +a

NEW_ROOT=$(rand)
NEW_APP=$(rand)
NEW_JWT_WEB=$(rand)
NEW_JWT_ADMIN=$(rand)

echo ">>> 更新 MySQL 账号密码"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV" exec -T mysql \
  mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "
ALTER USER 'root'@'%' IDENTIFIED BY '${NEW_ROOT}';
ALTER USER 'root'@'localhost' IDENTIFIED BY '${NEW_ROOT}';
ALTER USER '${MYSQL_USER}'@'%' IDENTIFIED BY '${NEW_APP}';
FLUSH PRIVILEGES;
"

patch() {
  local k=$1 v=$2
  if grep -q "^${k}=" "$ENV"; then
    sed -i "s/^${k}=.*/${k}=${v}/" "$ENV"
  fi
}

patch MYSQL_ROOT_PASSWORD "$NEW_ROOT"
patch MYSQL_PASSWORD "$NEW_APP"
patch JWT_SECRET_WEB "$NEW_JWT_WEB"
patch JWT_SECRET_ADMIN "$NEW_JWT_ADMIN"

mkdir -p "$KEY_DIR"
openssl genrsa -out "${KEY_DIR}/auth-rsa-private.pem" 2048
openssl rsa -in "${KEY_DIR}/auth-rsa-private.pem" -pubout -out "${KEY_DIR}/auth-rsa-public.pem"

bash "${ROOT}/scripts/secure-yiqi-layout.sh"

echo ">>> 重启服务（加载新密码 / JWT / RSA）"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV" up -d --force-recreate \
  mysql api-web admin-api web-web web-admin

echo ">>> 已轮换。Navicat 请从服务器读取新密码:"
echo "    grep MYSQL_PASSWORD= ${ENV}"
echo "    前台/后台需重新登录（JWT 已换）。"
