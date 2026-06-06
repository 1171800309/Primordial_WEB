#!/usr/bin/env bash
# 生成 .env 与 RSA 密钥（仅首次或轮换密钥时运行）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env"
KEY_DIR="${ROOT}/secrets/keys"

rand() { openssl rand -hex 32; }

mkdir -p "$KEY_DIR"
chmod 700 "${ROOT}/secrets" "$KEY_DIR"

if [[ ! -f "${KEY_DIR}/auth-rsa-private.pem" ]]; then
  openssl genrsa -out "${KEY_DIR}/auth-rsa-private.pem" 2048
  openssl rsa -in "${KEY_DIR}/auth-rsa-private.pem" -pubout -out "${KEY_DIR}/auth-rsa-public.pem"
  chmod 600 "${KEY_DIR}/auth-rsa-private.pem"
  chmod 644 "${KEY_DIR}/auth-rsa-public.pem"
  echo "已生成 RSA 密钥对 → secrets/keys/"
fi

if [[ -f "$ENV_FILE" ]]; then
  echo ".env 已存在，跳过覆盖（仅确保密钥存在）。删除 .env 后重跑可重新生成密码。"
  exit 0
fi

cp "${ROOT}/.env.example" "$ENV_FILE"
MYSQL_ROOT="$(rand)"
MYSQL_APP="$(rand)"
JWT_WEB="$(rand)"
JWT_ADMIN="$(rand)"

escape_sed() { printf '%s' "$1" | sed -e 's/[\/&]/\\&/g'; }

patch() {
  local key=$1 val=$2
  sed -i.bak "s/^${key}=.*/${key}=$(escape_sed "$val")/" "$ENV_FILE"
}

patch MYSQL_ROOT_PASSWORD "$MYSQL_ROOT"
patch MYSQL_PASSWORD "$MYSQL_APP"
patch JWT_SECRET_WEB "$JWT_WEB"
patch JWT_SECRET_ADMIN "$JWT_ADMIN"
rm -f "${ENV_FILE}.bak"

chmod 600 "$ENV_FILE"
echo "已创建 ${ENV_FILE}（请编辑 SITE_DOMAIN / ADMIN_DOMAIN / ACME_EMAIL）"
