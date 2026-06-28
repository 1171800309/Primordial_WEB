# ARCHITECTURE — 一炁文化系统架构

> 配套文档：[PROJECT_HANDOFF.md](./PROJECT_HANDOFF.md) · [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) · [TODO_FOR_CODEX.md](./TODO_FOR_CODEX.md)

---

## 1. 系统架构（文字版）

```
                         ┌─────────────────────────────────────────┐
                         │              用户浏览器                  │
                         └───────────────┬─────────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
              ▼                          ▼                          ▼
   ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
   │  Vue 用户前台     │      │  React 管理后台   │      │  Caddy (可选)     │
   │  primordial_web   │      │ primordial_admin  │      │  80/443 HTTPS    │
   │  Nginx :8001      │      │  Nginx :8004      │      │  deploy/cloud/   │
   │  WEB/web/         │      │  WEB/admin/       │      │  Caddyfile       │
   └────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
            │ /api 反代                │ /api/admin 反代          │
            ▼                          ▼                          │
   ┌──────────────────┐      ┌──────────────────┐                 │
   │  用户 API         │      │  管理 API         │                 │
   │ primordial_api_web│      │primordial_api_admin│                │
   │  ASP.NET :8080    │      │  ASP.NET :8080    │                 │
   │  API/web/         │      │  API/admin/       │                 │
   └────────┬─────────┘      └────────┬─────────┘                 │
            │                          │                          │
            └──────────────┬───────────┘                          │
                           ▼                                      │
                ┌──────────────────┐                              │
                │  MySQL 8.0        │◄─────────────────────────────┘
                │  primordial_culture│
                │  Docker 内网 only  │
                └──────────────────┘

   ┌────────────────── 构建 / 发版（生产推荐路径）──────────────────┐
   │  Dev Mac → SSH → NAS (192.168.2.224) docker compose build    │
   │         → docker save primordial-*:latest → tar.gz           │
   │         → 本机中转 scp → Cloud (43.139.172.61)                 │
   │         → load-images.sh → compose up                          │
   │  脚本: Primordial_WEB/scripts/release-nas-to-cloud.sh         │
   └───────────────────────────────────────────────────────────────┘
```

### 四容器镜像命名（运行时）

| Compose 服务 | 镜像 tag | 源码 |
|--------------|----------|------|
| `api-web` | `primordial-api-web:latest` | `Primordial_API/web/` |
| `api-admin` | `primordial-api-admin:latest` | `Primordial_API/admin/` |
| `web-web` | `primordial-web-web:latest` | `Primordial_WEB/web/` |
| `web-admin` | `primordial-web-admin:latest` | `Primordial_WEB/admin/` |

编排文件：`Primordial_WEB/deploy/cloud/docker-compose.images.yml`

---

## 2. 前端如何调用后端

### 用户前台（Vue）

```
浏览器 http://localhost:5173
    │
    │  axios baseURL = ''（相对路径）
    │  例: GET /api/me/trait-cards
    ▼
Vite dev proxy (web/vite.config.js)
    │  /api → https://127.0.0.1:58725
    ▼
Primordial.Api (Controllers)
    │  [Authorize] 读 JWT Bearer
    ▼
Services + AppDbContext → MySQL
```

**生产**：Nginx 在 `primordial_web` 容器内将 `/api` 反代到 `primordial_api_web`（见 `deploy/cloud/nginx/web.conf`）。

**响应格式约定**（用户 API）：

```json
{ "code": 200, "data": { ... }, "message": "可选" }
```

前端 `web/src/api/request.js` 在 `code !== 200` 时 reject。

### 管理后台（React）

```
浏览器 http://localhost:5174
    │
    │  fetch('/auth/login') 或 apiRequest('/users')
    ▼
Vite proxy (admin/vite.config.ts)
    │  /auth → http://localhost:5101/api/admin/auth
    │  /users → http://localhost:5101/api/admin/users
    ▼
Primordial.Admin.Api
```

**生产**：`admin` 容器 Nginx 反代（`deploy/cloud/nginx/admin.conf`）。

客户端：`admin/src/api/client.ts` — 期望 `{ code: 200, data }`，Bearer 来自 `localStorage.admin_access_token`。

---

## 3. 后端分层结构

### 用户 API（`Primordial_API/web/src/Primordial.Api/`）

```
Program.cs                 # DI 注册、JWT、Swagger
    │
Controllers/               # HTTP 入口，[Route] + [Authorize]
    │  参数校验、Claim 取 userId
    │  返回 Ok(new { code, data/message })
    ▼
Services/                  # 业务逻辑（词卡解析、雷达、密码）
    │  无 HTTP 依赖，可注入 AppDbContext
    ▼
Models/                    # EF 实体 + AppDbContext
    │
MySQL primordial_culture
```

**控制器命名约定**：

- `AuthController`, `PillarController`, `RegionController` — 注册/公开
- `Me*Controller` — 需登录，`[Authorize]`，从 JWT 取 `userId`
- `*PreviewController` — 注册流程预览，部分 AllowAnonymous

### 管理 API（`Primordial_API/admin/src/Primordial.Admin.Api/`）

```
Program.cs
    │  + StaticFiles /uploads（头像）
Controllers/
    │  [Route("api/admin/...")]
    │  [Authorize(Roles = "admin")]
    ▼
共享 Models/AppDbContext（与用户 API 同库）
    + admin/src/.../Services/（如 AvatarUploadService，未逐一列出）
```

**差异摘要**（对比用户 `Program.cs`）：

| 项 | 用户 API | 管理 API |
|----|----------|----------|
| Swagger 标题 | Primordial API | Primordial Admin API |
| 业务 Services | 词卡/雷达/变炁等 Scoped | 仅 PasswordCipher |
| 静态文件 | 无 | `/uploads` 头像 |
| JWT Secret | `JWT_SECRET_WEB` | `JWT_SECRET_ADMIN` |

---

## 4. 数据库表关系说明

EF 定义：`Primordial_API/web/src/Primordial.Api/Models/AppDbContext.cs`

### 用户域（核心）

```
users (1) ── (1) user_profiles
   │
   ├── (1) user_birth_profiles     # bazi_presentation_json 八字快照
   │
   ├── (N) user_login_log
   ├── (N) user_admin_audit_log
   ├── (N) user_trait_card_opens  # (user_id, slot_id) 唯一
   ├── (N) user_qi_events
   └── (N) shop_orders
```

**users 关键字段**（`Models/User.cs`）：

- `username`, `email`, `phone` — 唯一索引
- `password_hash` — BCrypt
- `user_type` — `member` | `admin`
- `status` — 1 正常 / 0 禁用

**user_birth_profiles**：

- `calendar_type`: solar | lunar
- `birth_datetime`, `province`, `city`, `district`
- `bazi_presentation_json` — **longtext**，下游所有命理功能的单一数据源

### 注册辅助表（lookup）

| 表 | 用途 |
|----|------|
| `three_pillars` | 年月日柱 lookup |
| `hour_pillars` | 时柱 |
| `true_solar_time` | 真太阳时 |
| `base_time_en` | 英文基时 |
| `birth_attributes` | 省市 → 经纬度、五行 |

### 先天词库表（只读 reference data）

| 表 | 词卡槽位 | Resolver |
|----|----------|----------|
| `benming_nayin_trait` | t1 本命纳音 | `InnateTraitCardResolver` |
| `innate_behavior_trait` | t3 | 同上 |
| `innate_talent_trait` | t5 先天天赋 | 同上 |
| `innate_character_trait` | t4 | 同上 |
| `innate_character_env_trait` | t6 | 同上 |
| `innate_social_personality` | t7 | 同上 |
| `innate_emotion_trait` | t8 | 同上 |
| `innate_potential_drive` | t9 | 同上 |
| `qi_state_entry` | t10 先天秉性 | 同上 |
| 隐藏词卡相关 | `011_hidden_trait_cards.sql` | `HiddenTraitCardResolver` |

**注**：槽位 t2 已下架（API commit `181b5eb`），前端 `xiantianTraitSlots.js` 与之对齐。

### 雷达配置表

`innate_radar_dimension`, `innate_radar_ten_god_score`, `innate_radar_element_score`, `innate_radar_season_factor`, `innate_radar_body_adjust`, `innate_radar_calc_config` — 由 `InnateRadarCalculator` 读取。

### 后天变炁表

`acquired_dayun_energy_trait`, `acquired_liunian_energy_trait`, `flow_year_library`

### 商城

`shop_orders` — 关联 `users.id`，状态流转由用户 pay + 管理 ship/complete 驱动。

---

## 5. 权限模型

```
                    ┌─────────────┐
                    │   匿名访问    │
                    └──────┬──────┘
                           │
     AllowAnonymous / 无 [Authorize]
     · POST /api/Auth/register|login
     · GET  /api/Auth/public-key
     · GET  /api/me/shop/orders/products
     · GET  /api/Pillar/*, /api/Region/*
                           │
                           ▼
                    ┌─────────────┐
                    │  member JWT  │  user_type = member
                    │  [Authorize] │
                    └──────┬──────┘
                           │
     · /api/me/* 仅操作自己的 userId（从 Claim 解析）
     · 不能访问 /api/admin/*
                           │
                           ▼
                    ┌─────────────┐
                    │  admin JWT   │  user_type = admin, Role = admin
                    │  [Authorize  │
                    │   (Roles=    │
                    │    admin)]   │
                    └─────────────┘
     · /api/admin/users|shop/*
     · 管理端登录校验 IsAdminUser()
```

**数据隔离**：用户 API 的 `Me*` 控制器均通过 `ClaimTypes.NameIdentifier` 过滤 `userId`，**未确认**是否存在跨用户 IDOR 审计。

---

## 6. 关键业务流程

### 6.1 登录

```
Login.vue
  → fetch GET /api/Auth/public-key
  → passwordCipher.encrypt(password) → ENC:base64...
  → POST /api/Auth/login { username, password }
  → AuthController: TryResolvePassword → BCrypt.Verify
  → BuildJwtToken → { token, user, baziAnalysis? }
  → localStorage.token / user
  → consumeSkipTokenValidation() → router → /hub
```

管理端类似，路径 `/api/admin/auth/login`，响应 `{ code, data: { token, user } }`。

### 6.2 创建数据

**注册（用户）** — `POST /api/Auth/register`

1. 校验用户名/手机唯一
2. 解密密码 → BCrypt 哈希
3. 事务写入 `users`, `user_profiles`, `user_birth_profiles`
4. 调用 pillar/region 逻辑生成 `bazi_presentation_json`
5. 返回 JWT

**炁事件** — `POST /api/me/qi-events`

1. JWT → userId
2. 校验字段 → insert `user_qi_events`

**商城订单** — `POST /api/me/shop/orders`

1. JWT → userId
2. `ShopCatalog` 校验 SKU
3. insert `shop_orders` status=pending

### 6.3 查询数据

**词卡** — `GET /api/me/trait-cards`

```
JWT → userId
  → UserBaziSnapshotService.TryResolveAsync(userId)
  → BaziTraitKeyExtractor.Extract(json)
  → InnateTraitCardResolver.ResolveAsync(json)    # 9 slots
  → HiddenTraitCardResolver.ResolveAsync(json)    # 0–N
  → user_trait_card_opens → opened flags
  → hiddenDiscovery { dayZhi, count, showModal, modalMessage }
```

**雷达** — `GET /api/me/radar-charts` → `InnateRadarCalculator`

**变炁** — `GET /api/me/bianqi?year=` → `AcquiredEnergyTraitResolver` + 流年

### 6.4 更新数据

**翻开词卡** — `POST /api/me/trait-cards/{slotId}/open`

- Upsert `user_trait_card_opens (user_id, slot_id)`

**管理编辑用户** — `PUT /api/admin/users/{id}`

- 更新 profile / birth / status 等，写 `user_admin_audit_log`

**订单发货** — `POST /api/admin/shop/orders/{id}/ship`

### 6.5 删除数据

**炁事件** — `DELETE /api/me/qi-events/{id}`

- 校验 `userId` 归属后删除

**用户删除** — **未确认**是否有用户 API；管理端 **未确认**是否提供 DELETE 用户接口（当前 Users 主要为 PUT + 禁用 status）。

---

## 7. 部署架构分支

| 模式 | 入口脚本 | 适用 |
|------|----------|------|
| **NAS 构建 → 云端 load** ★推荐 | `scripts/release-nas-to-cloud.sh` | 日常发版，tag 可控 |
| 云端 git pull build | `scripts/deploy-yiqi-cloud.sh` | 云端有源码时 |
| NAS 本地重建 | `scripts/deploy-yiqi-nas.sh` | 内网 NAS 测试 |
| 首次全量安装 | `deploy/nas-pack-cloud-release.sh` + `install-release.sh` | 含 MySQL dump |

---

*文档生成依据仓库扫描时间：2026-06-10。*
