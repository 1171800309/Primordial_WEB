#!/usr/bin/env bash
# 轮换云端密钥（密码曾在聊天中泄露时使用）。若 MySQL 已有数据需另行处理密码同步。
set -euo pipefail

ROOT="${YIQI_ROOT:-/opt/yiqi}"
ENV="${ROOT}/.env"
KEY_DIR="${ROOT}/secrets/keys"

rand() { openssl rand -hex 32; }

[[ -f "$ENV" ]] || { echo "缺少 ${ENV}" >&2; exit 1; }

if docker ps --format '{{.Names}}' 2>/dev/null | grep -q primordial_mysql; then
  echo "警告: MySQL 容器已在运行，轮换数据库密码需手动 ALTER USER，本脚本仅更新 .env 文件。" >&2
  read -r -p "继续仅更新 .env 与 RSA? [y/N] " ans
  [[ "${ans,,}" == "y" ]] || exit 1
fi

patch() {
  local k=$1 v=$2
  if grep -q "^${k}=" "$ENV"; then
    sed -i "s/^${k}=.*/${k}=${v}/" "$ENV"
  fi
}

patch MYSQL_ROOT_PASSWORD "$(rand)"
patch MYSQL_PASSWORD "$(rand)"
patch JWT_SECRET_WEB "$(rand)"
patch JWT_SECRET_ADMIN "$(rand)"

mkdir -p "$KEY_DIR"
openssl genrsa -out "${KEY_DIR}/auth-rsa-private.pem" 2048
openssl rsa -in "${KEY_DIR}/auth-rsa-private.pem" -pubout -out "${KEY_DIR}/auth-rsa-public.pem"
chmod 700 "${ROOT}/secrets" "$KEY_DIR"
chmod 600 "${ENV}" "${KEY_DIR}/auth-rsa-private.pem"
chmod 644 "${KEY_DIR}/auth-rsa-public.pem"

echo "已轮换 ${ENV} 与 RSA 密钥（$(date -Iseconds)）"
