# DEVELOPMENT_GUIDE — 一炁文化开发指南

> 配套：[PROJECT_HANDOFF.md](./PROJECT_HANDOFF.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [TODO_FOR_CODEX.md](./TODO_FOR_CODEX.md)

---

## 1. 代码风格（本项目实际约定）

### 通用原则

- **最小改动**：只改需求相关文件，不顺手重构
- **对称 monorepo**：WEB 与 API 各含 `web/`（用户端）+ `admin/`（管理端）
- **中文 UI 文案**与**中文词库**是产品核心，禁止破坏 utf8mb4
- **路径别名**：Vue 用 `@/` → `web/src/`（`vite.config.js`）

### 前端（Vue 用户站）

| 项 | 约定 |
|----|------|
| 语法 | Vue 3 `<script setup>` + Composition API |
| 页面 class | `prototype-page <name>-page` |
| 样式 | 页面 CSS 放 `web/src/styles/pages/`，组件 scoped 或独立 CSS |
| API | 统一走 `web/src/api/request.js`，不在 view 里裸 axios |
| 路由 | 新增页必须改 `web/src/router/index.js` 并考虑 `publicRoutes` |
| 常量 | 槽位/静态 UI 元数据放 `web/src/constants/`，服务端内容从 API 来 |

### 前端（React 管理端）

| 项 | 约定 |
|----|------|
| 语法 | 函数组件 + TypeScript |
| 状态 | `AuthContext` 管登录态 |
| API | `admin/src/api/client.ts` 的 `apiRequest<T>()` |
| 路由 | 在 `admin/src/App.tsx` 注册，需登录的套 `ProtectedRoute` |

### 后端（C#）

| 项 | 约定 |
|----|------|
| 框架 | ASP.NET Core 8，Controller + Service + EF |
| 路由 | 用户 `api/me/*`；管理 `api/admin/*` |
| 响应 | `Ok(new { code = 200, data = ... })` 或 `code = 4xx, message = "..."` |
| 鉴权 | 用户 `[Authorize]`；管理 `[Authorize(Roles = "admin")]` |
| 密码 | 必须经 `PasswordCipherService`，存储用 BCrypt |
| XML 注释 | Auth 等核心 Controller 有 `<summary>`，Swagger 会展示 |

---

## 2. 前端组件规范

### 页面骨架

参考：`web/src/views/XianTianPage.vue`, `HubPage.vue`

```vue
<template>
  <div class="prototype-page xiantian-page">
    <div class="page-transition" :class="{ loaded }">...</div>
    <canvas ref="canvasRef" />
    <div class="top-nav">...</div>
    <!-- 主内容 -->
  </div>
</template>

<script setup>
import { usePageTransition } from '@/composables/usePageTransition'
import { useDustCanvas } from '@/composables/useDustCanvas'
import '@/styles/prototype-base.css'
import '@/styles/pages/xiantian-page.css'
</script>
```

### 词卡组件族（可复用）

路径：`web/src/components/trait/`

| 组件 | 用途 |
|------|------|
| `TraitCardCarousel.vue` | 横向滑动容器 |
| `AutoFitTraitTitle.vue` / `AutoFitTraitCardBody.vue` | 自适应字号 |
| `TraitCardFrame.vue` | 边框装饰 |

数据流：**constants 槽位** + **API 内容** + **cardStates reactive 开合状态**。

### Composables

| 文件 | 何时用 |
|------|--------|
| `useSegmentControl.js` | 顶部 Tab 滑块（先天三 Tab） |
| `useBackToHub.js` | 统一返回 `/hub` |
| `usePageTransition.js` | Logo 入场环动画 |
| `useDustCanvas.js` / `useOrbitCanvas.js` | 背景粒子 |

---

## 3. 后端接口规范

### 新增用户 API 端点 checklist

1. 在 `Primordial_API/web/src/Primordial.Api/Controllers/` 新建或扩展 Controller
2. 路由：`[Route("api/me/your-resource")]` + `[Authorize]`
3. 从 `User.FindFirst(ClaimTypes.NameIdentifier)` 取 `userId`，**禁止**信任 body 中的 userId
4. 业务逻辑 >30 行时抽到 `Services/`
5. 返回 `{ code, data/message }`
6. 在 `Program.cs` 注册新 Service（如需要）：`builder.Services.AddScoped<YourService>()`
7. 前端在 `web/src/api/` 增加函数并在页面调用
8. Swagger 自测：`https://localhost:58725/swagger`

### 新增管理 API 端点 checklist

1. Controller 放 `Primordial_API/admin/src/Primordial.Admin.Api/Controllers/`
2. `[Route("api/admin/...")]` + `[Authorize(Roles = "admin")]`
3. 前端 `admin/src/api/*.ts` + 页面
4. **本地 dev**：若路径不在 `/auth`、`/users`，需在 `admin/vite.config.ts` 增加 proxy 或设置 `VITE_ADMIN_API_URL`

### 公开接口

仅注册、登录、public-key、商品列表等必要接口使用 `[AllowAnonymous]`。

---

## 4. 数据库字段命名规范

从现有 Entity 归纳（`Models/*.cs`）：

| 规则 | 示例 |
|------|------|
| 表名 | snake_case 复数或语义名：`users`, `user_birth_profiles`, `innate_talent_trait` |
| 列名 | snake_case：`user_id`, `password_hash`, `created_at` |
| 主键 | `id` BIGINT 自增 |
| 时间 | `created_at`, `updated_at`（DateTime） |
| 外键列 | `{entity}_id` |
| EF 映射 | `[Column("snake_name")]` + `[Table("table_name")]` |
| ENUM | MySQL ENUM 用 string 属性 + `HasColumnType("enum(...)")` |
| JSON 快照 | `*_json` longtext，如 `bazi_presentation_json` |

**迁移文件命名**：`Primordial_API/web/database/mysql/NNN_description.sql`（递增编号）。

**执行迁移**：

```bash
cd Primordial_API
MYSQL_PASSWORD='...' ./scripts/apply-mysql-migration.sh 013_your_migration.sql
# 云端：
./scripts/apply-cloud-sql.sh 013_your_migration.sql
```

**必须**带 `--default-character-set=utf8mb4`（脚本已内置）。

---

## 5. 如何新增一个页面（用户前台）

1. **创建视图**  
   `web/src/views/YourPage.vue` — 使用 `prototype-page` 布局

2. **样式**  
   `web/src/styles/pages/your-page.css` 并在 vue 中 import

3. **路由**  
   `web/src/router/index.js`：
   ```js
   { path: '/your-path', name: 'your-page', component: YourPage }
   ```
   若需登录：不要加入 `publicRoutes` 数组

4. **入口**  
   在 `HubPage.vue` 的 `orbs` 或相关导航添加入口

5. **API**（若需要）  
   `web/src/api/yourModule.js` → 在页面 `import` 调用

6. **自测**  
   `npm run dev` → 登录态访问新路由

---

## 6. 如何新增一个接口

见 §3。最小示例：

**后端** `Controllers/MeExampleController.cs`：

```csharp
[ApiController]
[Route("api/me/example")]
[Authorize]
public class MeExampleController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(sub, out var userId))
            return Ok(new { code = 401, message = "登录状态无效" });
        return Ok(new { code = 200, data = new { userId } });
    }
}
```

**前端** `web/src/api/example.js`：

```js
import request from './request'
export const fetchExample = () => request.get('/api/me/example')
```

---

## 7. 如何新增一张表

1. **SQL 迁移**  
   编写 `Primordial_API/web/database/mysql/013_my_table.sql`（含 `CREATE TABLE`、索引、COMMENT）

2. **EF 实体**  
   `Models/MyEntity.cs` — `[Table]` / `[Column]`

3. **DbContext**  
   `AppDbContext.cs` 添加 `DbSet<MyEntity>` 与 `OnModelCreating` 索引/关系

4. **执行 SQL**  
   本地隧道或 `apply-cloud-sql.sh`

5. **Service/Controller**  
   读写新表

6. **未使用 EF Migration 工具** — 不要期望 `dotnet ef database update` 自动生效

---

## 8. 如何排查常见问题

| 现象 | 排查步骤 |
|------|----------|
| 5173 调 API 404 | API 是否 `dotnet run`；`vite.config.js` proxy target 是否 58725 |
| 401 频繁登出 | token 过期；`session.js` 空闲超时；检查 `validateToken` |
| 词卡/隐藏卡为空 | `user_birth_profiles.bazi_presentation_json` 是否存在；词库表是否有匹配键；**字符集是否 utf8mb4** |
| 中文乱码 | 重导 SQL with utf8mb4；检查连接串 `Charset=utf8mb4` |
| 云端 UI 旧版本 | `docker exec primordial_web ls assets/` 对比 JS hash；是否 load 了正确 `primordial-web-web:latest` |
| NAS 构建后云未更新 | 是否走 `release-nas-to-cloud.sh` 完整四步；看 VERIFY_OK |
| 管理端本地订单 API 失败 | vite 是否缺少 `/shop` proxy；设 `VITE_ADMIN_API_URL` 指向完整 admin API |
| MySQL 连不上 | 隧道是否运行；`setup-dev-db-from-cloud.sh` 是否最新 |
| Swagger 401 | Authorize 按钮填 `Bearer {token}` |
| Docker 前端 env 不生效 | 必须 rebuild 镜像，`VITE_*` 在 build.args |

**日志**：

```bash
# 云端
docker logs primordial_api_web --tail 100
docker logs primordial_web --tail 50
```

---

## 9. 提交代码前检查清单

### 前端

- [ ] `npm run build`（web / admin）无报错
- [ ] 新路由已注册且鉴权正确
- [ ] API 路径与后端 Swagger 一致（注意大小写 `Auth` vs `auth` — ASP.NET 默认不区分）
- [ ] 未提交 `.env`、`appsettings.Development.json`、密钥
- [ ] 页面在移动端基本可用（产品大量 mobile 场景）

### 后端

- [ ] `dotnet build` 通过
- [ ] 新接口有 `[Authorize]`（除非公开）
- [ ] 用户数据按 `userId` 隔离
- [ ] 涉及中文词库/SQL 时使用 utf8mb4
- [ ] 可选：`dotnet test`（`Primordial_API/web/`）

### 发版（若需要上云）

- [ ] WEB + API 均已 push `main`
- [ ] `./scripts/release-nas-to-cloud.sh` 输出 `VERIFY_OK`
- [ ] 云端抽查关键页面（先天词卡、隐藏卡流程）

### 数据库变更

- [ ] 新增 `NNN_*.sql` 文件
- [ ] 已在测试库执行验证
- [ ] 生产执行记录（apply-cloud-sql 输出）

---

## 10. 本地开发速查

```bash
# Terminal 1 — DB 隧道
cd Primordial_API && ./scripts/cloud-db-tunnel.sh

# Terminal 2 — 用户 API
cd Primordial_API/web/src/Primordial.Api && dotnet run

# Terminal 3 — 用户前台
cd Primordial_WEB/web && npm run dev

# Terminal 4（可选）— 管理 API + 后台
cd Primordial_API/admin/src/Primordial.Admin.Api && dotnet run
cd Primordial_WEB/admin && npm run dev
```

端口表见 `DEBUG.md`。

---

*文档生成依据仓库扫描时间：2026-06-10。*
