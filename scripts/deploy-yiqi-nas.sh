#!/usr/bin/env bash
# 从本机触发 NAS 上一炁文化（Primordial）全量发版（SSH 公钥，不用密码）
# 用法: ./scripts/deploy-yiqi-nas.sh
# 首次: ./scripts/setup-nas-ssh-key.sh（本机终端执行一次，密码仅你本地输入）
# 可选: YIQI_NAS_HOST=192.168.2.224  YIQI_NAS_USER=Bely  YIQI_NAS_SSH_KEY=~/.ssh/id_ed25519  YIQI_NAS_NO_CACHE=1

set -euo pipefail

HOST="${YIQI_NAS_HOST:-192.168.2.224}"
USER="${YIQI_NAS_USER:-Bely}"
KEY="${YIQI_NAS_SSH_KEY:-$HOME/.ssh/id_ed25519}"
REMOTE_DEPLOY="/home/Bely/deploy.sh"

[[ -f "$KEY" ]] || { echo "缺少私钥 ${KEY}，或先运行 ./scripts/setup-nas-ssh-key.sh" >&2; exit 1; }

SSH_OPTS=(-i "$KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=15 -o BatchMode=yes)

echo ">>> 连接 ${USER}@${HOST} 执行发版 ..."
EXTRA_ENV=""
if [[ "${YIQI_NAS_NO_CACHE:-}" == "1" ]]; then
  EXTRA_ENV="YIQI_NAS_NO_CACHE=1"
fi
ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" "${EXTRA_ENV} bash ${REMOTE_DEPLOY}"
echo ">>> 发版命令已执行完毕"
