#!/usr/bin/env bash
# 一次性：把本机 SSH 公钥写入 NAS（仅在本机终端运行，密码由你手动输入，勿告诉 Agent）
set -euo pipefail

HOST="${YIQI_NAS_HOST:-192.168.2.224}"
USER="${YIQI_NAS_USER:-Bely}"
PUB="${YIQI_NAS_SSH_KEY:-$HOME/.ssh/id_ed25519}.pub"

[[ -f "$PUB" ]] || { echo "缺少 ${PUB}" >&2; exit 1; }

echo ">>> 将把公钥安装到 ${USER}@${HOST}"
echo ">>> 接下来会提示输入 NAS 密码（仅此一次，不会写入仓库）"
ssh-copy-id -i "$PUB" -o StrictHostKeyChecking=no "${USER}@${HOST}"

echo ">>> 测试密钥登录（不应再要密码）"
ssh -i "${PUB%.pub}" -o BatchMode=yes -o StrictHostKeyChecking=no "${USER}@${HOST}" 'echo "NAS 密钥登录 OK"'

echo ">>> 完成。之后使用: ssh -i ~/.ssh/id_ed25519 ${USER}@${HOST}"
