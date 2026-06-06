#!/usr/bin/env bash
# 在 NAS 上打包「云端一站式发布包」：镜像 + MySQL 全库 + 初始化 SQL + 配置脚本
# 用法: bash nas-pack-cloud-release.sh
# 可选上传: YIQI_UPLOAD=1 YIQI_CLOUD_SSH_KEY=~/.ssh/id_ed25519（在能 ssh 到云的机器上执行 scp 段）

set -euo pipefail

COMPOSE="${YIQI_NAS_COMPOSE:-/home/Bely/docker-compose}"
RELEASE="${YIQI_RELEASE_DIR:-/home/Bely/yiqi-cloud-release}"
CLOUD_HOST="${YIQI_CLOUD_HOST:-43.139.172.61}"
CLOUD_USER="${YIQI_CLOUD_USER:-ubuntu}"
CLOUD_KEY="${YIQI_CLOUD_SSH_KEY:-$HOME/.ssh/id_ed25519}"
CONFIG_SRC="${YIQI_CONFIG_SRC:-/home/Bely/code/Primordial_WEB/deploy/cloud}"

mkdir -p "$RELEASE"/{images,mysql,config/scripts,config/initdb}

echo ">>> [1/4] MySQL 导出"
: "${YIQI_MYSQL_ROOT_PASS:?请设置 YIQI_MYSQL_ROOT_PASS（勿写入仓库）}"
docker exec mysql-1 mysqldump -uroot -p"${YIQI_MYSQL_ROOT_PASS}" \
  --single-transaction --routines --triggers --events \
  --databases primordial_culture 2>/dev/null | gzip > "$RELEASE/mysql/primordial_culture.dump.gz"
ls -lh "$RELEASE/mysql/primordial_culture.dump.gz"

echo ">>> [2/4] 初始化 SQL"
cp -f /home/Bely/code/Primordial_API/web/database/mysql/*.sql "$RELEASE/config/initdb/" 2>/dev/null || true

echo ">>> [3/4] Docker 镜像（需已 build，见文档）"
[[ -f "$RELEASE/images/primordial-images.tar.gz" ]] || {
  echo "请先构建并导出 primordial-images.tar.gz 到 ${RELEASE}/images/" >&2
  exit 1
}

echo ">>> [4/4] 云端配置"
cp -f "$CONFIG_SRC/docker-compose.images.yml" "$CONFIG_SRC/Caddyfile" "$RELEASE/config/"
cp -f "$CONFIG_SRC/scripts/"*.sh "$RELEASE/config/scripts/"
chmod +x "$RELEASE/config/scripts/"*.sh

TAR="/home/Bely/yiqi-cloud-release.tar.gz"
tar czf "$TAR" -C "$(dirname "$RELEASE")" "$(basename "$RELEASE")"
ls -lh "$TAR"
echo "发布包: ${TAR}"

if [[ "${YIQI_UPLOAD:-}" == "1" ]] && [[ -f "$CLOUD_KEY" ]]; then
  scp -i "$CLOUD_KEY" -o StrictHostKeyChecking=no "$TAR" "${CLOUD_USER}@${CLOUD_HOST}:/opt/yiqi/"
  ssh -i "$CLOUD_KEY" -o StrictHostKeyChecking=no "${CLOUD_USER}@${CLOUD_HOST}" \
    "chmod +x /opt/yiqi/scripts/install-release.sh 2>/dev/null; /opt/yiqi/scripts/install-release.sh /opt/yiqi/yiqi-cloud-release.tar.gz"
fi
