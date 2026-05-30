# 管理后台说明

- 后端：`Primordial_API/admin`（独立服务，端口 5101）
- 接口前缀：容器/nginx 侧将 `/auth`、`/users` 转发到后端 `/api/admin/*`；前端请求使用相对路径（如 `/auth/login`）
- 与用户 API（`Primordial_API/web`，本地 **58725**）分离部署
