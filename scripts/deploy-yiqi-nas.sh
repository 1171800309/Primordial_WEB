#!/usr/bin/env bash
# 从本机触发 NAS 上一炁文化（Primordial）全量发版
# 用法: YIQI_NAS_SSH_PASS='你的密码' ./scripts/deploy-yiqi-nas.sh
# 可选: YIQI_NAS_HOST=192.168.2.224  YIQI_NAS_USER=Bely  YIQI_NAS_NO_CACHE=1

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${YIQI_NAS_HOST:-192.168.2.224}"
USER="${YIQI_NAS_USER:-Bely}"
REMOTE_DEPLOY="/home/Bely/deploy.sh"

if [[ -z "${YIQI_NAS_SSH_PASS:-}" ]]; then
  echo "请设置环境变量 YIQI_NAS_SSH_PASS（勿写入仓库）" >&2
  exit 1
fi

if ! command -v sshpass >/dev/null 2>&1; then
  echo "需要 sshpass：brew install hudochenkov/sshpass/sshpass" >&2
  exit 1
fi

SSH_OPTS=(-o StrictHostKeyChecking=no -o ConnectTimeout=15)
export SSHPASS="$YIQI_NAS_SSH_PASS"

echo ">>> 连接 ${USER}@${HOST} 执行发版 ..."
EXTRA_ENV=""
if [[ "${YIQI_NAS_NO_CACHE:-}" == "1" ]]; then
  EXTRA_ENV="YIQI_NAS_NO_CACHE=1"
fi
SSHPASS="$YIQI_NAS_SSH_PASS" sshpass -e ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" "${EXTRA_ENV} bash ${REMOTE_DEPLOY}"
echo ">>> 发版命令已执行完毕"
