#!/usr/bin/env bash
# 云端一键安装：加载镜像 + 导入 NAS 数据库 + 启动全栈
# 用法: sudo ./scripts/install-release.sh /path/to/yiqi-cloud-release.tar.gz
set -euo pipefail

YIQI_ROOT="${YIQI_ROOT:-/opt/yiqi}"
BUNDLE="${1:-${YIQI_ROOT}/yiqi-cloud-release.tar.gz}"

if [[ ! -f "$BUNDLE" ]]; then
  echo "找不到发布包: ${BUNDLE}" >&2
  exit 1
fi

if [[ ! -f "${YIQI_ROOT}/.env" ]]; then
  echo "缺少 ${YIQI_ROOT}/.env，请先配置域名与密钥" >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a && source "${YIQI_ROOT}/.env" && set +a

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

echo ">>> 解压发布包"
tar xzf "$BUNDLE" -C "$WORK"
RELEASE=$(find "$WORK" -maxdepth 1 -type d -name 'yiqi-cloud-release*' | head -1)
[[ -n "$RELEASE" ]] || RELEASE="$WORK"

mkdir -p "${YIQI_ROOT}/images" "${YIQI_ROOT}/mysql" "${YIQI_ROOT}/initdb" "${YIQI_ROOT}/backups"
cp -f "$RELEASE/images/"*.tar.gz "${YIQI_ROOT}/images/" 2>/dev/null || true
cp -f "$RELEASE/mysql/"*.gz "${YIQI_ROOT}/mysql/" 2>/dev/null || true
mkdir -p "${YIQI_ROOT}/initdb-archive"
cp -f "$RELEASE/config/initdb/"*.sql "${YIQI_ROOT}/initdb-archive/" 2>/dev/null || true
cp -f "$RELEASE/config/"*.yml "$RELEASE/config/Caddyfile" "${YIQI_ROOT}/" 2>/dev/null || true
cp -f "$RELEASE/config/scripts/"*.sh "${YIQI_ROOT}/scripts/" 2>/dev/null || true
chmod +x "${YIQI_ROOT}/scripts/"*.sh

echo ">>> 加载 Docker 镜像"
gunzip -c "${YIQI_ROOT}/images/primordial-images.tar.gz" | docker load

COMPOSE_FILE="${YIQI_ROOT}/docker-compose.images.yml"
cd "$YIQI_ROOT"

echo ">>> 启动 MySQL（仅数据库）"
docker compose -f "$COMPOSE_FILE" --env-file .env up -d mysql

echo ">>> 等待 MySQL 就绪"
for i in $(seq 1 60); do
  if docker compose -f "$COMPOSE_FILE" --env-file .env exec -T mysql mysqladmin ping -h 127.0.0.1 -uroot -p"${MYSQL_ROOT_PASSWORD}" --silent 2>/dev/null; then
    echo "MySQL 已就绪"
    break
  fi
  sleep 2
  [[ $i -eq 60 ]] && { echo "MySQL 启动超时" >&2; exit 1; }
done

echo ">>> 导入 NAS 数据库（覆盖 primordial_culture）"
bash "${YIQI_ROOT}/scripts/import-mysql.sh" "${YIQI_ROOT}/mysql/primordial_culture.dump.gz"

echo ">>> 启动全部服务"
docker compose -f "$COMPOSE_FILE" --env-file .env up -d

echo ">>> 服务状态"
docker compose -f "$COMPOSE_FILE" --env-file .env ps

echo ""
echo "安装完成。测试数据库: ${YIQI_ROOT}/scripts/test-db.sh"
