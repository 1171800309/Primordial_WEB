#!/usr/bin/env bash
# 从本机 SSH 触发云服务器发版
# 用法:
#   export YIQI_CLOUD_HOST=你的公网IP或域名
#   export YIQI_CLOUD_USER=ubuntu
#   ./scripts/deploy-yiqi-cloud.sh

set -euo pipefail

HOST="${YIQI_CLOUD_HOST:-}"
USER="${YIQI_CLOUD_USER:-ubuntu}"
REMOTE="${YIQI_CLOUD_DEPLOY_DIR:-/opt/yiqi/Primordial_WEB/deploy/cloud}"

if [[ -z "$HOST" ]]; then
  echo "请设置 YIQI_CLOUD_HOST" >&2
  exit 1
fi

SSH_OPTS=(-o ConnectTimeout=20 -o BatchMode=yes)
KEY="${YIQI_CLOUD_SSH_KEY:-$HOME/.ssh/id_ed25519}"
if [[ -f "$KEY" ]]; then
  SSH_OPTS+=(-i "$KEY")
else
  echo "未找到 SSH 密钥 ${KEY}，云服务器已禁用密码登录" >&2
  exit 1
fi

EXTRA=""
if [[ "${YIQI_NO_CACHE:-}" == "1" ]]; then
  EXTRA="YIQI_NO_CACHE=1"
fi

REMOTE_CMD="cd ${REMOTE} && ${EXTRA} ./scripts/load-images.sh"
if [[ "${YIQI_CLOUD_MODE:-}" != "images" ]]; then
  REMOTE_CMD="cd ${REMOTE} && ${EXTRA} ./scripts/deploy.sh"
fi

echo ">>> ${USER}@${HOST} 执行云发版 …"
ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" "${REMOTE_CMD}"
echo ">>> 云发版完成"
