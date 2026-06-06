#!/usr/bin/env bash
# 将生产 nginx 覆盖到构建上下文（不修改 Git 仓库原文件的可选方案：直接覆盖工作区）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "${ROOT}/.env"

WEB_ROOT="${PRIMORDIAL_WEB_ROOT:?}/web"
cp -f "${ROOT}/nginx/web.conf" "${WEB_ROOT}/nginx.conf"
echo "已应用 cloud nginx → ${WEB_ROOT}/nginx.conf"
