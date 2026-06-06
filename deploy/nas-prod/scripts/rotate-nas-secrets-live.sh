#!/usr/bin/env bash
# NAS：轮换 MySQL root 密码并更新 docker-compose/.env（在 NAS 上执行）
set -euo pipefail

ENV_FILE="${YIQI_NAS_ENV:-/home/Bely/docker-compose/.env}"
COMPOSE_DIR="${YIQI_NAS_COMPOSE:-/home/Bely/docker-compose}"

rand() { openssl rand -hex 32; }

[[ -f "$ENV_FILE" ]] && grep -q '^DB_CONNECTION=' "$ENV_FILE" || {
  echo "缺少 ${ENV_FILE} 或 DB_CONNECTION" >&2
  exit 1
}

OLD_PASS=$(grep -oP 'Password=\K[^;]+' "$ENV_FILE" | head -1)
[[ -n "$OLD_PASS" ]] || { echo "无法从 DB_CONNECTION 解析旧密码" >&2; exit 1; }

NEW_ROOT=$(rand)
NEW_JWT_WEB=$(rand)
NEW_JWT_ADMIN=$(rand)

echo ">>> 更新 MySQL root 密码"
docker exec mysql-1 mysql -uroot -p"${OLD_PASS}" -e "
ALTER USER 'root'@'%' IDENTIFIED BY '${NEW_ROOT}';
ALTER USER 'root'@'localhost' IDENTIFIED BY '${NEW_ROOT}';
FLUSH PRIVILEGES;
"

NEW_CONN="Server=mysql-1;Port=3306;Database=primordial_culture;User=root;Password=${NEW_ROOT};Charset=utf8mb4;SslMode=None;AllowPublicKeyRetrieval=True;"
umask 077
sed -i "s|^DB_CONNECTION=.*|DB_CONNECTION=${NEW_CONN}|" "$ENV_FILE"
sed -i "s|^JWT_SECRET_WEB=.*|JWT_SECRET_WEB=${NEW_JWT_WEB}|" "$ENV_FILE"
sed -i "s|^JWT_SECRET_ADMIN=.*|JWT_SECRET_ADMIN=${NEW_JWT_ADMIN}|" "$ENV_FILE"
chmod 600 "$ENV_FILE"

cd "$COMPOSE_DIR"
docker compose up -d --force-recreate api-web api-admin

echo ">>> NAS 密钥已轮换（$(date -Iseconds)）"
