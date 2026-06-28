# PROJECT_HANDOFF — 一炁文化（Primordial）项目交接

> 本文档面向 **Codex / 新接手的 AI Agent**。  
> 代码分布在 **两个 Git 仓库**（对称 monorepo 结构）：
>
> | 仓库 | 路径（本机示例） | 职责 |
> |------|------------------|------|
> | **Primordial_WEB** | `/Users/xiaxin/Project/Code/Primordial_WEB` | 用户前台 Vue + 管理后台 React + 部署脚本 |
> | **Primordial_API** | `/Users/xiaxin/Project/Code/Primordial_API` | 用户 API + 管理 API + MySQL 迁移 SQL |

---

## 项目一句话介绍

**一炁文化（YIQI）** 是一个以八字命理为数据基础的 Web 产品：用户注册时录入出生信息并生成命盘快照，在「先天 / 后天 / 炁象台 / 万炁之城」等模块中浏览恒炁数、特性词卡、八维雷达图、大运流年变炁、人生炁事件与盲盒商城；管理员通过 React 后台管理用户与订单。

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **用户前台** | Vue 3.5 + Vue Router 4 + Vite 7 + Element Plus + Axios | `Primordial_WEB/web/` |
| **管理后台** | React 19 + React Router 7 + TypeScript + Vite 8 | `Primordial_WEB/admin/` |
| **用户 API** | ASP.NET Core 8 + EF Core + MySQL | `Primordial_API/web/src/Primordial.Api/` |
| **管理 API** | ASP.NET Core 8 + EF Core + MySQL | `Primordial_API/admin/src/Primordial.Admin.Api/` |
| **数据库** | MySQL 8.0，库名 `primordial_culture` | 生产在云端 Docker 内网 |
| **鉴权** | JWT Bearer + BCrypt 密码哈希 + RSA-OAEP 传输加密 | 见 `PasswordCipherService.cs` |
| **部署** | Docker Compose（NAS 构建四镜像 → 本机中转 → 云端 load） | 标准脚本见下文 |
| **反向代理** | Nginx（容器内）+ Caddy（云端 HTTPS，可选 profile） | `deploy/cloud/` |

---

## 仓库目录结构

### Primordial_WEB（本仓库根）

```
Primordial_WEB/
├── web/                    # 用户 SPA（Vue）
│   ├── src/
│   │   ├── api/            # Axios 封装与业务 API
│   │   ├── views/          # 页面
│   │   ├── components/     # trait / destiny / layout / wanqi 等
│   │   ├── composables/    # 画布、分段 Tab、页面过渡
│   │   ├── constants/      # 词卡槽位、盲盒、炁等级
│   │   ├── utils/          # session、密码加密、八字工具
│   │   ├── router/index.js
│   │   └── styles/         # 主题 + 各页 CSS
│   ├── vite.config.js
│   ├── Dockerfile
│   └── package.json
├── admin/                  # 管理 SPA（React）
│   ├── src/
│   │   ├── api/            # fetch 客户端
│   │   ├── auth/AuthContext.tsx
│   │   ├── pages/          # Dashboard / Users / Orders / Login
│   │   └── layout/AdminLayout.tsx
│   ├── vite.config.ts
│   └── package.json
├── deploy/                 # NAS + 云端部署配置
│   ├── cloud/              # 生产云（43.139.172.61）
│   ├── nas-prod/           # NAS 生产 appsettings 覆盖
│   └── nas-export-images.sh
├── scripts/
│   ├── release-nas-to-cloud.sh   # ★ 标准发版
│   ├── deploy-yiqi-nas.sh
│   └── deploy-yiqi-cloud.sh
├── DEBUG.md                # 本地联调端口
└── README.md
```

### Primordial_API（兄弟仓库）

```
Primordial_API/
├── web/
│   ├── src/Primordial.Api/
│   │   ├── Controllers/    # 用户 API 控制器
│   │   ├── Models/         # EF 实体 + AppDbContext
│   │   ├── Services/       # 词卡解析、雷达、密码解密等
│   │   └── Program.cs
│   ├── database/mysql/     # 增量 SQL 迁移 001–012
│   ├── database/scripts/   # Word → SQL 生成脚本
│   └── tests/
├── admin/
│   └── src/Primordial.Admin.Api/
│       └── Controllers/    # 管理 API
└── scripts/
    ├── apply-mysql-migration.sh
    ├── apply-cloud-sql.sh
    ├── cloud-db-tunnel.sh
    └── setup-dev-db-from-cloud.sh
```

---

## 启动方式

### 前置：本地数据库（云端 MySQL 经 SSH 隧道）

```bash
cd Primordial_API
./scripts/setup-dev-db-from-cloud.sh    # 同步连接串到 appsettings.Development.json
./scripts/cloud-db-tunnel.sh            # 另开终端保持运行 → 127.0.0.1:3306
```

详见 `Primordial_WEB/DEBUG.md`、`Primordial_API/README.md`。

### 用户 API（后端）

```bash
cd Primordial_API/web/src/Primordial.Api
dotnet run
# 或 Cursor F5 选「用户 API (web)」
# → https://localhost:58725/swagger
```

### 管理 API（后端）

```bash
cd Primordial_API/admin/src/Primordial.Admin.Api
dotnet run
# → http://localhost:5101/swagger
```

### 用户前台（前端）

```bash
cd Primordial_WEB/web
npm install
npm run dev
# → http://localhost:5173
# Vite 代理 /api → https://127.0.0.1:58725
```

### 管理后台（前端）

```bash
cd Primordial_WEB/admin
npm install
npm run dev
# → http://localhost:5174
# 代理 /auth、/users → http://localhost:5101/api/admin/*
```

### 工作区一键调试（未确认是否在本机已配置）

`/Users/xiaxin/Project/Code/Primordial.code-workspace` — 可选「前台全栈」或「后台全栈」F5 配置。

---

## 环境变量说明

### 云端生产 `.env`

文件：`Primordial_WEB/deploy/cloud/.env.example` → 复制为云端 `/opt/yiqi/.env`

| 变量 | 用途 |
|------|------|
| `SITE_DOMAIN` / `ADMIN_DOMAIN` / `ACME_EMAIL` | Caddy HTTPS |
| `MYSQL_*` | Docker MySQL |
| `JWT_SECRET_WEB` / `JWT_SECRET_ADMIN` | 两套 JWT 密钥 |
| `PRIMORDIAL_WEB_ROOT` / `PRIMORDIAL_API_ROOT` | git 构建发版用（镜像发版可忽略） |

### 用户前台（Vite，`web/`）

`web/.env.example` **未在仓库中提交**（README 有提及）。代码中实际读取：

| 变量 | 默认 / 说明 | 引用文件 |
|------|-------------|----------|
| `VITE_API_PROXY_TARGET` | `https://127.0.0.1:58725` | `web/vite.config.js` |
| `VITE_API_BASE_URL` | 空 = 相对路径 | `web/src/api/request.js` |
| `VITE_IDLE_TIMEOUT_MS` | 默认 5 分钟空闲登出 | `web/src/utils/session.js` |
| `VITE_TOKEN_VALIDATE_PATH` | 默认 `/api/Auth/userinfo` | `web/src/api/auth.js` |
| `VITE_AUTH_PUBLIC_KEY_PEM` | RSA 公钥（可选，否则 fetch） | `web/src/utils/passwordCipher.js` |
| `VITE_TOKEN_VALIDATE_CACHE_MS` | 路由校验缓存 | `web/src/router/index.js` |

### 管理后台（Vite，`admin/`）

文件：`admin/.env.example`

| 变量 | 说明 |
|------|------|
| `VITE_ADMIN_API_URL` | 生产填完整 URL；本地留空走代理 |
| `VITE_AUTH_PUBLIC_KEY_PEM` | 可选 |

### 后端 `appsettings`

- 模板：`Primordial_API/web/src/Primordial.Api/appsettings.Development.json.example`
- 本地实际：`appsettings.Development.json`（**gitignore**）
- 关键节：`ConnectionStrings:DefaultConnection`、`Jwt:*`、`AuthPasswordCipher:*`（RSA 密钥路径）

NAS 生产覆盖：`Primordial_WEB/deploy/nas-prod/Primordial_API/`

---

## 数据库连接与初始化

### 连接

- **库名**：`primordial_culture`
- **字符集**：必须使用 **utf8mb4**（中文词库匹配依赖此点）
- **生产**：MySQL 仅在 Docker 内网，不暴露公网；应用容器通过 compose 网络连接

### 初始化 / 迁移方式

本项目 **无 EF Migrations 自动迁移**，采用 **手工 SQL 文件**：

| 路径 | 说明 |
|------|------|
| `Primordial_API/web/database/mysql/001_*.sql` … `012_*.sql` | 增量 DDL/DML |
| `Primordial_API/web/database/mysql/README_INNATE_TRAIT_DEPLOY.md` | 词库部署顺序说明 |
| `Primordial_API/scripts/apply-mysql-migration.sh` | 本地/隧道执行 SQL（强制 utf8mb4） |
| `Primordial_API/scripts/apply-cloud-sql.sh` | 云端 docker exec 执行 |
| `Primordial_API/scripts/setup-dev-db-from-cloud.sh` | 从云端 `.env` 同步 dev 配置 |

**未确认**：`users`、三柱表等 **基线建表 SQL** 不在 `001–012` 目录中，可能来自历史 dump 或 NAS 全库导出（`deploy/cloud/CLOUD-NAS.md` 提到约 46 张表）。

### 词库数据来源（示例）

| 表 | SQL | 生成脚本 |
|----|-----|----------|
| `innate_talent_trait` | `012_innate_talent_trait.sql` | `web/database/scripts/parse_innate_talent_docx.py` |
| `qi_state_entry` | `007_*.sql` | `generate_qi_state_entry_deploy_sql.py` |
| 隐藏词卡 | `011_hidden_trait_cards.sql` | — |

---

## 主要业务模块

| 模块 | 用户页面 | 核心 API | 核心服务 |
|------|----------|----------|----------|
| 注册 / 登录 | `web/src/views/Register.vue`, `Login.vue` | `AuthController.cs` | `PasswordCipherService`, 注册内嵌八字计算 |
| 导航中枢 | `HubPage.vue` | — | — |
| 先天·恒炁域 | `XianTianPage.vue` | `/api/me/henqi`, `/api/me/trait-cards`, `/api/me/radar-charts` | `InnateTraitCardResolver`, `HiddenTraitCardResolver`, `InnateRadarCalculator` |
| 隐藏词卡 | `HiddenCardPage.vue` | 同上 trait-cards | `HiddenTraitCardResolver` |
| 后天·变炁域 | `BianQiPage.vue` | `/api/me/bianqi` | `AcquiredEnergyTraitResolver`, `FlowYearResolver` |
| 炁象台 | `QiXiangTaiPage.vue` | `/api/me/qi-events` | — |
| 万炁之城（商城） | `WanQiPage.vue` | `/api/me/shop/orders` | `ShopCatalog.cs` |
| 个人中心 | `ProfilePage.vue` | `/api/Auth/userinfo`, `/api/me/bazi` | — |
| 注册加载仪式 | `RegisterLoadingPage.vue` | 注册返回的 bazi 数据 | `registerLoadingSequence.js` |
| 管理：用户 | `admin/src/pages/UsersPage.tsx`, `UserEditPage.tsx` | `/api/admin/users` | — |
| 管理：订单 | `admin/src/pages/OrdersPage.tsx` | `/api/admin/shop/orders` | — |

---

## 核心页面清单

路由定义：`web/src/router/index.js`

| 路由 | 组件 | 需登录 |
|------|------|--------|
| `/` | `LandingPage.vue` | 否 |
| `/login` | `Login.vue` | 否 |
| `/register` | `Register.vue` | 否 |
| `/register-loading` | `RegisterLoadingPage.vue` | 是 |
| `/hub` | `HubPage.vue` | 是 |
| `/xiantian` | `XianTianPage.vue` | 是 |
| `/bianqi` | `BianQiPage.vue` | 是 |
| `/qixiangtai` | `QiXiangTaiPage.vue` | 是 |
| `/wanqi` | `WanQiPage.vue` | 是 |
| `/hidden-card` | `HiddenCardPage.vue` | 是 |
| `/profile` | `ProfilePage.vue` | 是 |
| `/terms`, `/privacy` | `TermsPage.vue`, `PrivacyPage.vue` | 否 |

管理后台路由：`admin/src/App.tsx` — `/login`, `/`, `/users`, `/users/:id`, `/orders`

---

## 核心接口清单

### 用户 API（`Primordial_API/web/src/Primordial.Api/Controllers/`）

| 控制器 | 路由前缀 | 主要端点 |
|--------|----------|----------|
| `AuthController` | `/api/Auth` | `POST register`, `POST login`, `GET userinfo`, `GET validate`, `GET public-key`, `POST logout`, `POST init-admin-password` |
| `MeTraitCardsController` | `/api/me/trait-cards` | `GET` 词卡+隐藏卡, `POST {slotId}/open` |
| `MeHenqiController` | `/api/me/henqi` | `GET` 恒炁数 |
| `MeRadarChartsController` | `/api/me/radar-charts` | `GET` 八维图 |
| `MeBianQiController` | `/api/me/bianqi` | `GET` 后天变炁 |
| `MeQiEventsController` | `/api/me/qi-events` | `GET/POST/DELETE` |
| `MeShopOrdersController` | `/api/me/shop/orders` | `GET products`, `GET/POST`, `POST {id}/pay` |
| `MeBaziController` | `/api/me/bazi` | `GET` 命盘 JSON |
| `MeTianGanTaiXuanController` | `/api/me/tiangan-taixuan` | `GET` |
| `PillarController` | `/api/Pillar` | 注册用年月日三柱、analysis |
| `RegionController` | `/api/Region` | 省市区、时柱 |
| `HenqiController` | `/api/Henqi` | `POST compute` |
| `DayunPreviewController` | `/api/dayun-preview` | 大运预览（注册流程） |
| `TianGanTaiXuanPreviewController` | `/api/tiangan-taixuan-preview` | 预览 |

前端封装：`web/src/api/` — `auth.js`, `me.js`, `qiEvents.js`, `shop.js`, `calendar.js`, `region.js`, `henqi.js`

### 管理 API（`Primordial_API/admin/.../Controllers/`）

| 控制器 | 路由前缀 | 主要端点 |
|--------|----------|----------|
| `AdminAuthController` | `/api/admin/auth` | `GET public-key`, `POST login`, `GET me`, `POST logout` |
| `AdminUsersController` | `/api/admin/users` | CRUD、avatar、password、logs、`POST recompute-bazi` |
| `AdminShopOrdersController` | `/api/admin/shop/orders` | `GET`, `POST {id}/ship`, `POST {id}/complete` |

---

## 核心服务类（后端）

路径：`Primordial_API/web/src/Primordial.Api/Services/`

| 文件 | 职责 |
|------|------|
| `PasswordCipherService.cs` | RSA-OAEP 解密登录密码 |
| `UserBaziSnapshotService.cs` | 从 `user_birth_profiles.bazi_presentation_json` 取八字快照 |
| `BaziTraitKeyExtractor.cs` | 从八字 JSON 提取纳音、十神、日柱等匹配键 |
| `InnateTraitCardResolver.cs` | 9 张先天词卡（多表 JOIN 逻辑） |
| `HiddenTraitCardResolver.cs` | 隐藏词卡（十神 + 日柱等） |
| `InnateRadarCalculator.cs` + `InnateRadarConfigService.cs` | 八维雷达计算 |
| `AcquiredEnergyTraitResolver.cs` + `FlowYearResolver.cs` | 后天大运/流年 |
| `ShopCatalog.cs` | 商城 SKU 静态目录 |
| `NayinLexicon.cs` / `NayinRelationHelper.cs` | 纳音工具 |

---

## 登录鉴权逻辑

### 用户端

1. **注册/登录**：`web/src/api/auth.js` → 密码经 `passwordCipher.js` RSA 加密（`ENC:` 前缀）→ `POST /api/Auth/login|register`
2. **服务端**：`PasswordCipherService.TryResolvePassword` → BCrypt 校验 → 签发 JWT（Claims: `NameIdentifier`, `Name`, `Role`= `user_type`）
3. **存储**：`localStorage.token` + `localStorage.user`
4. **请求**：`web/src/api/request.js` 拦截器附加 `Authorization: Bearer`
5. **路由守卫**：`web/src/router/index.js` — 公开路由白名单；定期 `validateToken()`；401/403 清 session
6. **空闲超时**：`web/src/utils/session.js` — 默认 5 分钟无操作拒绝请求

### 管理端

1. **登录**：`admin/src/api/auth.ts` → `POST /api/admin/auth/login`
2. **权限**：仅 `users.user_type == 'admin'` 可登录；JWT Role = `admin`
3. **存储**：`admin_access_token`, `admin_current_user`
4. **路由**：`admin/src/components/ProtectedRoute.tsx`
5. **控制器**：`[Authorize(Roles = "admin")]`

### 两套 JWT

用户 API 与管理 API 使用 **不同的 `Jwt:SecretKey`**（云端 `JWT_SECRET_WEB` / `JWT_SECRET_ADMIN`）。

---

## 数据流转（典型路径）

### 注册

```
Register.vue
  → calendar.js / region.js（选日期、地点、时柱）
  → POST /api/Auth/register
  → AuthController：写 users + user_profiles + user_birth_profiles
  → 计算 bazi_presentation_json 写入 birth profile
  → 返回 token + baziAnalysis
  → RegisterLoadingPage.vue（动画序列）
  → /hub
```

### 先天词卡

```
XianTianPage.vue
  → GET /api/me/trait-cards
  → UserBaziSnapshotService → BaziTraitKeyExtractor
  → InnateTraitCardResolver + HiddenTraitCardResolver 查词库表
  → 合并 user_trait_card_opens  opened 状态
  → 用户点击翻开 → POST /api/me/trait-cards/{slotId}/open
  → 9 张全部打开 + 有隐藏卡 → 延迟 3s → 惊喜弹窗（hiddenCardUnlock.js）
```

### 商城下单

```
WanQiPage.vue → shop.js
  → GET /api/me/shop/orders/products
  → POST /api/me/shop/orders → shop_orders 表
  → POST pay（模拟支付，未确认是否接真实支付网关）
  → 管理端 OrdersPage → ship / complete
```

---

## 目前已实现功能清单

- [x] 用户注册（阳历/农历、省市区、时柱、性别）
- [x] RSA 加密传输 + JWT 登录/session
- [x] 注册加载页（纳音、经典文案动画）
- [x] 导航中枢（Hub 四入口）
- [x] 先天页：恒炁数解码动画、9 张特性词卡（阴阳翻转、轮播、分级徽章）
- [x] 隐藏词卡（按八字匹配，惊喜解锁流程 + 独立页）
- [x] 八维雷达图（正八边形 canvas）
- [x] 后天变炁页（大运/流年，待开启封面态）
- [x] 炁象台（人生炁事件 CRUD）
- [x] 万炁之城盲盒商城（下单、模拟支付）
- [x] 个人中心、用户协议/隐私页
- [x] 管理后台：登录、用户列表/编辑、头像、改密、审计日志、订单发货
- [x] NAS → 云端镜像发版流水线
- [x] 云端 MySQL + Caddy HTTPS 方案

---

## 已知问题与注意事项

| 问题 | 说明 |
|------|------|
| **SQL 字符集** | 导入词库必须 `--default-character-set=utf8mb4`，否则十神/日柱中文乱码导致隐藏卡匹配失败 |
| **镜像 tag** | 云端必须用 `primordial-*:latest`，勿与 `primordial-cloud-*` 混用；见 `deploy/cloud/scripts/tag-runtime-images.sh` |
| **NAS 无法直 scp 云** | 发版必须本机中转：`scripts/release-nas-to-cloud.sh` |
| **NAS compose build.args** | 前端 `VITE_*` 必须写在 Docker `build.args`，写 `environment` 无效 |
| **`init-admin-password`** | 无鉴权，生产需网络层限制 |
| **`GET /api/Auth/users`** | 任意有效 JWT 可列用户 — **未确认**是否仅开发用途 |
| **`recompute-bazi`** | 管理端接口名暗示重算，代码可能仅回写已有 JSON — **未确认** |
| **admin dev 代理** | `admin/vite.config.ts` 未代理 `/shop`，本地测订单可能需配 `VITE_ADMIN_API_URL` 或补代理 |
| **web/.env.example** | 仓库未提交，新开发者需参考 DEBUG.md 与 vite.config.js |

---

## 新需求开发时优先阅读

| 优先级 | 文件 | 原因 |
|--------|------|------|
| 1 | `Primordial_WEB/DEBUG.md` | 端口、隧道、联调顺序 |
| 2 | `web/src/router/index.js` | 路由与鉴权 |
| 3 | `web/src/api/request.js` + `web/src/api/*.js` | 前后端契约 |
| 4 | `Primordial_API/web/src/Primordial.Api/Models/AppDbContext.cs` | 全部表实体 |
| 5 | `MeTraitCardsController.cs` + `InnateTraitCardResolver.cs` | 词卡业务样板 |
| 6 | `AuthController.cs` | 注册/登录/八字写入 |
| 7 | `web/src/views/XianTianPage.vue` | 最复杂页面（Tab + 词卡 + 雷达 + 隐藏卡） |
| 8 | `scripts/release-nas-to-cloud.sh` | 发版 |
| 9 | `deploy/cloud/CLOUD-NAS.md` | 生产架构 |
| 10 | `.cursor/rules/yiqi-cloud-deploy.mdc` | Agent 发版规则 |

---

## 生产访问地址（参考）

| 环境 | 地址 |
|------|------|
| 云端用户站 | http://43.139.172.61:8001 |
| 云端管理 | http://43.139.172.61:8004 |
| NAS 用户站 | https://192.168.2.224:8001 |
| NAS 管理 HTTPS | https://192.168.2.224:8443 |

域名模式见 `deploy/cloud/.env` 中 `SITE_DOMAIN` / `ADMIN_DOMAIN`。

---

*文档生成依据仓库扫描时间：2026-06-10，WEB `445e7f5`，API `4aa491a`。*
