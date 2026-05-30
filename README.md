# Primordial 前端 Monorepo

与 `Primordial_API` 对称：**`web/`** + **`admin/`**。

## 命名对照

| 仓库 | 用户端 | 管理端 |
|------|--------|--------|
| Primordial_WEB | `web/` Vue 前台 | `admin/` React 后台 |
| Primordial_API | `web/` 用户 API | `admin/` 管理 API |

## 本地开发

```bash
# 后端
cd ../Primordial_API/web/src/Primordial.Api && dotnet run      # F5 或 :58725
cd ../Primordial_API/admin/src/Primordial.Admin.Api && dotnet run  # :5101

# 前端
cd web && npm run dev    # :5173
cd admin && npm run dev  # :5174 → 代理 :5101
```

详见各包 `README.md` 与 **[DEBUG.md](DEBUG.md)**（联调端口与 F5 启动顺序）。
