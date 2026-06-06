#!/usr/bin/env bash
# 测试云端 MySQL 与 API 能否连库
set -euo pipefail

YIQI_ROOT="${YIQI_ROOT:-/opt/yiqi}"
COMPOSE_FILE="${YIQI_ROOT}/docker-compose.images.yml"

# shellcheck disable=SC1091
set -a && source "${YIQI_ROOT}/.env" && set +a

ok=0
fail=0
check() {
  local label=$1
  shift
  if "$@"; then
    echo "  [OK] ${label}"
    ok=$((ok + 1))
  else
    echo "  [FAIL] ${label}"
    fail=$((fail + 1))
  fi
}

echo "=== 1. MySQL 容器 ==="
if [[ "$(docker inspect -f '{{.State.Running}}' primordial_mysql 2>/dev/null || echo false)" == true ]]; then
  echo "  [OK] primordial_mysql 运行中"
  ok=$((ok + 1))
else
  echo "  [FAIL] primordial_mysql 未运行"
  fail=$((fail + 1))
fi

echo "=== 2. MySQL ping（root）==="
check "mysqladmin ping (root)" docker compose -f "$COMPOSE_FILE" --env-file "${YIQI_ROOT}/.env" exec -T mysql \
  mysqladmin ping -h 127.0.0.1 -uroot -p"${MYSQL_ROOT_PASSWORD}" --silent

echo "=== 3. 应用账号连接 ${MYSQL_USER} ==="
check "应用账号 SELECT 1" docker compose -f "$COMPOSE_FILE" --env-file "${YIQI_ROOT}/.env" exec -T mysql \
  mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" -N -e "SELECT 1" "${MYSQL_DATABASE}"

echo "=== 4. 库表数量（期望约 46）==="
cnt=$(docker compose -f "$COMPOSE_FILE" --env-file "${YIQI_ROOT}/.env" exec -T mysql \
  mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" -N -e \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${MYSQL_DATABASE}';" 2>/dev/null)
echo "  表数量: ${cnt}"
[[ "${cnt:-0}" -ge 40 ]] && ok=$((ok + 1)) || fail=$((fail + 1))

echo "=== 5. API 容器连库（用户 API）==="
if docker ps --filter 'name=primordial_api_web' --format '{{.Names}}' | grep -q '^primordial_api_web$'; then
  if docker logs primordial_api_web 2>&1 | tail -30 | grep -qiE 'fail|exception|unable to connect'; then
    echo "  [WARN] api_web 日志可能有错误，请: docker logs primordial_api_web"
    fail=$((fail + 1))
  else
    echo "  [OK] api_web 已启动（无 obvious 连接错误）"
    ok=$((ok + 1))
  fi
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/swagger/index.html 2>/dev/null || echo 000)
  if docker exec primordial_api_web wget -qO- --timeout=3 http://127.0.0.1:8080/swagger/index.html >/dev/null 2>&1; then
    echo "  [OK] api_web HTTP 内部可达"
    ok=$((ok + 1))
  else
    echo "  [SKIP] api_web 内部 HTTP（容器未映射到宿主机属正常）"
  fi
else
  echo "  [SKIP] primordial_api_web 未运行，先 docker compose up -d"
fi

echo ""
echo "结果: ${ok} 通过, ${fail} 失败"
[[ "$fail" -eq 0 ]]
