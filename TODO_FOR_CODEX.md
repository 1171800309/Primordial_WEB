# TODO_FOR_CODEX — 后续工作与风险提示

> 给 Codex 的 actionable 清单。配套：[PROJECT_HANDOFF.md](./PROJECT_HANDOFF.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

---

## 推荐入手顺序（第一次接项目）

```
1. 读 PROJECT_HANDOFF.md + DEBUG.md
2. 搭本地环境（隧道 + API + web dev）
3. 走通：注册 → hub → 先天页（词卡 + 雷达）→ 隐藏卡
4. 读 MeTraitCardsController + InnateTraitCardResolver（业务核心样板）
5. 再碰管理后台 / 商城 / 变炁
```

**第一个 PR 建议域**：与产品方确认的小功能（如炁象台优化、Profile 字段）— **不要**先改注册八字核心或发版脚本。

---

## 当前项目还缺什么（待完善 / 未确认）

### 产品功能缺口

| 项 | 状态 | 相关路径 |
|----|------|----------|
| 真实支付网关 | 商城 `pay` 疑似模拟支付 | `MeShopOrdersController.cs`, `WanQiPage.vue` |
| 用户自助改出生信息 | **未确认**是否有完整流程 | `ProfilePage.vue`, `MeBaziController.cs` |
| 用户注销 / 删号 | **未确认** | — |
| 忘记密码 | **未确认** | — |
| 管理端 Dashboard 数据看板 | 页面存在但可能为占位 | `admin/src/pages/DashboardPage.tsx` |
| 词库 CMS | 词库靠 SQL/Word 脚本，无在线编辑 | `web/database/scripts/` |
| 单元测试覆盖 | 仅 API 有 test 项目，覆盖有限 | `Primordial_API/web/tests/` |
| `web/.env.example` | 未提交仓库 | 应补一份模板 |
| i18n | 全中文硬编码 | 全局 |

### 工程化缺口

| 项 | 说明 |
|----|------|
| CI/CD | 无 GitHub Actions；发版靠本地 shell + NAS |
| EF Migrations | 用手写 SQL，无版本自动追踪表 |
| 基线 schema SQL | `001–012` 仅为增量，全库结构靠 dump |
| API 版本化 | 无 `/api/v1` 前缀 |
| 统一错误码枚举 | `code` 为魔法数字 |
| admin dev `/shop` proxy | `admin/vite.config.ts` 可能缺订单路由代理 |

---

## 哪些代码可以优化（非紧急）

| 区域 | 建议 | 文件 |
|------|------|------|
| AuthController 体积 | 注册+八字逻辑拆 Service | `AuthController.cs`（1100+ 行） |
| 词卡 UI 状态 | `cardStates` reactive 模式可抽 composable | `XianTianPage.vue`, `HiddenCardPage.vue` |
| API 响应类型 | 前端 TS 化（admin 已 TS，web 仍 JS） | `web/src/api/` |
| `GET /api/Auth/users` | 生产应移除或加 admin 鉴权 | `AuthController.cs` |
| `init-admin-password` | 生产禁用或 IP 白名单 | `AuthController.cs` |
| 雷达 canvas | 抽离 `drawRadarChart`  util | `XianTianPage.vue` |
| 样式文件 | 部分中文文件名 CSS（`隐藏词卡.css`） | `web/src/styles/pages/` |
| Docker 构建时间 | NAS 无缓存构建慢，可 layer cache 优化 | NAS compose |

**原则**：优化前先问产品优先级；Auth/注册/发版脚本优化风险高。

---

## 哪些地方不要轻易改

| 区域 | 原因 | 路径 |
|------|------|------|
| **注册 + 八字快照写入** | 下游词卡/雷达/变炁全部依赖 `bazi_presentation_json` 结构 | `AuthController.cs`, `BaziChinesePresentationBuilder.cs`, `UserBaziSnapshotService.cs` |
| **BaziTraitKeyExtractor** | 改键名会导致全库词卡匹配失败 | `Services/BaziTraitKeyExtractor.cs` |
| **InnateTraitCardResolver 槽位映射** | t1–t10 与前端 `xiantianTraitSlots.js` 必须一致 | Resolver + constants |
| **hiddenCardUnlock 流程** | 产品刚定稿：最后一张卡延迟 3s 惊喜弹窗 | `hiddenCardUnlock.js`, `XianTianPage.vue` |
| **release-nas-to-cloud.sh** | 生产唯一可靠发版路径；tag/中转任一步错即全站旧版 | `scripts/release-nas-to-cloud.sh` |
| **MySQL utf8mb4 导入** | 乱码会导致十神/日柱匹配静默失败 | `apply-mysql-migration.sh`, `apply-cloud-sql.sh` |
| **JWT 双密钥** | WEB/ADMIN 混用会导致偶发 401 | 云端 `.env`, appsettings |
| **NAS compose build.args** | VITE 变量写错位置 = 生产 API 地址错误 | NAS `docker-compose` |
| **词库 SQL 全量替换** | 错误 DELETE 会导致线上用户无词卡 | `web/database/mysql/007_*.sql` 等 |
| **PasswordCipherService** | 改算法需前后端同步 | WEB `passwordCipher.js` + API Service |

---

## 已知技术债（来自代码/历史对话）

1. **`recompute-bazi`** 管理接口 — 名称与实现可能不一致（**未确认**是否真重算）
2. **`primordial-cloud-*` 旧镜像 tag** — 云端勿混用（见 `tag-runtime-images.sh`）
3. **NAS `web_admin_service` 曾 Restarting** — 发版后需观察 admin 容器
4. **跨用户 localStorage 污染** — 已改为 `xq_hidden_unlock_ack_{userId}`，勿改回全局 key
5. **t2 槽位已下架** — 勿恢复 unless 产品要求 + SQL/API/前端三处同步

---

## 推荐 Codex 下一步任务（按优先级）

### P0 — 稳定性 / 文档

- [ ] 补 `web/.env.example` 并写入 README
- [ ] 为 `admin/vite.config.ts` 补 `/shop` dev proxy（若本地测订单）
- [ ] 审计 `GET /api/Auth/users` 与 `init-admin-password` 生产暴露面

### P1 — 产品向（需产品确认后再做）

- [ ] 个人中心完善（头像、昵称、出生信息展示）
- [ ] 万炁之城订单状态 UI 与物流信息
- [ ] 后天变炁页交互 polish（大运/流年切换）
- [ ] 炁象台列表/筛选/编辑体验

### P2 — 工程向

- [ ] AuthController 拆分注册服务
- [ ] 补充 `MeTraitCardsController` 集成测试（固定八字 JSON → 期望词卡）
- [ ] GitHub Action：`npm run build` + `dotnet test` on push

### P3 — 长期

- [ ] 词库管理后台（CRUD reference tables）
- [ ] 真实支付接入
- [ ] 用户前台 TypeScript 迁移

---

## 发版相关（Agent 必须知道）

用户说「发布 / 发版 / 部署一炁」时：

```bash
cd Primordial_WEB
git push   # 确保 WEB（及 API 变更）已在 main
./scripts/release-nas-to-cloud.sh
# 等待 VERIFY_OK
```

**不要**默认在云端 `git pull && docker build`（易 tag 不一致）。规则见 `.cursor/rules/yiqi-cloud-deploy.mdc`。

---

## 需求评审时要问的问题

新增命理相关功能前：

1. 数据从 `bazi_presentation_json` 取还是实时重算？
2. 是否涉及新词库表 / Word 文档导入？
3. 槽位 ID 是否影响已有 `user_trait_card_opens`？
4. 是否需要管理端配置入口？
5. 是否影响注册流程？

---

## 关键文件速查（复制给 Codex system prompt）

```
Primordial_WEB/web/src/router/index.js
Primordial_WEB/web/src/views/XianTianPage.vue
Primordial_WEB/web/src/api/me.js
Primordial_WEB/scripts/release-nas-to-cloud.sh
Primordial_API/web/src/Primordial.Api/Controllers/AuthController.cs
Primordial_API/web/src/Primordial.Api/Controllers/MeTraitCardsController.cs
Primordial_API/web/src/Primordial.Api/Services/InnateTraitCardResolver.cs
Primordial_API/web/src/Primordial.Api/Services/HiddenTraitCardResolver.cs
Primordial_API/web/src/Primordial.Api/Models/AppDbContext.cs
Primordial_API/web/database/mysql/
Primordial_WEB/DEBUG.md
```

---

*文档生成依据仓库扫描时间：2026-06-10，WEB `445e7f5`，API `4aa491a`。*
