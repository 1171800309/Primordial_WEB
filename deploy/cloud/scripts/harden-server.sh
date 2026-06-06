#!/usr/bin/env bash
# 腾讯云安全加固（需 root）。建议在已配置 SSH 公钥后执行。
set -euo pipefail

DEPLOY_USER="${YIQI_DEPLOY_USER:-ubuntu}"
YIQI_ROOT="${YIQI_ROOT:-/opt/yiqi}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "请 sudo 运行" >&2
  exit 1
fi

echo ">>> fail2ban"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y fail2ban
cat > /etc/fail2ban/jail.local << 'JAIL'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
JAIL
systemctl enable --now fail2ban

echo ">>> SSH 加固"
mkdir -p /etc/ssh/sshd_config.d
if [[ -f /etc/ssh/sshd_config.d/50-cloud-init.conf ]]; then
  sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config.d/50-cloud-init.conf
fi
echo 'PasswordAuthentication no' > /etc/ssh/sshd_config.d/60-yiqi-password.conf

cat > /etc/ssh/sshd_config.d/99-yiqi-hardening.conf << 'SSHD'
# 一炁文化 · SSH 安全
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
ChallengeResponseAuthentication no
PubkeyAuthentication yes
AuthenticationMethods publickey
X11Forwarding no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
AllowUsers ubuntu
SSHD
sshd -t
systemctl reload sshd

echo ">>> 应用目录权限"
if [[ -d "$YIQI_ROOT" ]]; then
  chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "$YIQI_ROOT"
  chmod 750 "$YIQI_ROOT" 2>/dev/null || true
  chmod 700 "$YIQI_ROOT/secrets" "$YIQI_ROOT/secrets/keys" 2>/dev/null || true
  chmod 600 "$YIQI_ROOT/.env" 2>/dev/null || true
  chmod 600 "$YIQI_ROOT/secrets/keys/"*.pem 2>/dev/null || true
  chmod 700 "$YIQI_ROOT/backups" "$YIQI_ROOT/images" 2>/dev/null || true
  [[ -x "${YIQI_ROOT}/scripts/secure-yiqi-layout.sh" ]] && sudo -u "${DEPLOY_USER}" bash "${YIQI_ROOT}/scripts/secure-yiqi-layout.sh" || true
fi

echo ">>> 自动安全更新（可选组件）"
DEBIAN_FRONTEND=noninteractive apt-get install -y unattended-upgrades apt-listchanges
dpkg-reconfigure -plow unattended-upgrades 2>/dev/null || true

echo ">>> 完成。请确认已用 SSH 密钥测试登录后再关闭当前会话。"
