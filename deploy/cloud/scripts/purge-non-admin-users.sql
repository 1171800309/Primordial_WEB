-- 仅保留 user_type = 'admin' 的账号（通常为 username=admin）
-- 用法: 由 purge-non-admin-users.sh 在备份后执行

START TRANSACTION;

SET @admin_id := (
  SELECT id FROM users
  WHERE user_type = 'admin'
  ORDER BY id
  LIMIT 1
);

SELECT @admin_id AS kept_admin_id;

DELETE FROM user_trait_card_opens WHERE user_id IS NOT NULL AND user_id <> @admin_id;
DELETE FROM user_qi_events WHERE user_id <> @admin_id;
DELETE FROM user_fate_analyses WHERE user_id <> @admin_id;
DELETE FROM user_login_log WHERE user_id IS NOT NULL AND user_id <> @admin_id;
DELETE FROM user_admin_audit_logs WHERE user_id <> @admin_id;
DELETE FROM user_birth_profiles WHERE user_id <> @admin_id;
DELETE FROM user_profiles WHERE user_id <> @admin_id;
DELETE FROM users WHERE id <> @admin_id;

COMMIT;

SELECT id, username, user_type, status FROM users;
SELECT COUNT(*) AS remaining_users FROM users;
