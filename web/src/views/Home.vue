<template>
  <div class="home-layout yiqi-shell">
    <el-container class="outer">
      <el-aside class="aside">
        <div class="brand">
          <span class="brand-mark">一炁</span>
          <span class="brand-text">天机台</span>
        </div>
        <el-menu
          :default-active="active"
          :mode="menuMode"
          class="menu yiqi-menu"
          background-color="transparent"
          text-color="#9a9a8e"
          active-text-color="#e8e4dc"
          @select="onMenuSelect"
        >
          <el-menu-item index="dashboard">天机 · 命盘</el-menu-item>
          <el-menu-item index="users">缘众录</el-menu-item>
          <el-menu-item index="settings">仪轨</el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="header">
          <div class="header-left">
            <span class="header-title">{{ active === 'dashboard' ? '命盘推演' : active === 'users' ? '缘众录' : '仪轨' }}</span>
            <span class="header-sub">东方玄学推演</span>
          </div>
          <div class="header-right">
            <span class="welcome">缘主 <em>{{ user.username }}</em></span>
            <el-button class="btn-exit" size="small" @click="handleLogout">退出天机</el-button>
          </div>
        </el-header>

        <el-main class="main">
          <div v-if="active === 'dashboard'">
            <el-card class="yiqi-card fate-card mingpan-card" shadow="never">
              <template #header>
                <div class="fate-header">
                  <span class="fate-title">命盘天机</span>
                  <el-button size="small" class="btn-refresh" :loading="baziLoading" @click="handleRefreshBazi">重演天机</el-button>
                </div>
              </template>
              <MingPanTianJi
                :bazi="baziAnalysis"
                :loading="baziLoading"
                :error="baziError"
                :empty-hint="baziEmptyHint"
                :hour-summary="hourSummary"
              />
            </el-card>

            <el-card class="yiqi-card stat-card" shadow="never">
              <template #header><span class="card-head">气数总览</span></template>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="8">
                  <div class="stat">
                    <div class="stat-value">{{ stats.totalUsers }}</div>
                    <div class="stat-label">总用户数</div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8">
                  <div class="stat">
                    <div class="stat-value">{{ stats.todayLogins }}</div>
                    <div class="stat-label">今日登录</div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8">
                  <div class="stat">
                    <div class="stat-value">{{ stats.vipUsers }}</div>
                    <div class="stat-label">VIP用户</div>
                  </div>
                </el-col>
              </el-row>
            </el-card>

            <el-card class="yiqi-card mingpan-detail mingge-fate-card" shadow="never">
              <template #header><span class="card-head">命格推演法阵 · 命格显现</span></template>
              <DestinyRevealMatrix :form="analysisForm" :bazi="baziAnalysis" />
            </el-card>

            <el-card class="yiqi-card" shadow="never">
              <template #header><span class="card-head">仪轨 · 快捷</span></template>
              <el-space wrap>
                <el-button type="primary">新增用户</el-button>
                <el-button>导出数据</el-button>
                <el-button>查看日志</el-button>
              </el-space>
            </el-card>
          </div>

          <div v-else-if="active === 'users'">
            <el-card class="yiqi-card" shadow="never">
              <template #header><span class="card-head">缘众录（占位）</span></template>
              <el-table :data="mockUsers" style="width: 100%;">
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="role" label="角色" />
                <el-table-column prop="status" label="状态" />
              </el-table>
            </el-card>
          </div>

          <div v-else>
            <el-card class="yiqi-card" shadow="never">
              <template #header><span class="card-head">仪轨（占位）</span></template>
              <el-form :model="mockSettings" label-width="120px">
                <el-form-item label="系统名称">
                  <el-input v-model="mockSettings.appName" />
                </el-form-item>
                <el-form-item label="接口地址">
                  <el-input v-model="mockSettings.apiBaseUrl" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary">保存（占位）</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logout } from '@/api/auth'
import { analyzeByUser } from '@/api/fate'
import {
  readStoredBaziAnalysis,
  persistBaziAnalysis,
  parseBaziAnalysisFromToken,
  mapBaziAnalysisToForm
} from '@/utils/baziAnalysis'
import MingPanTianJi from '@/components/destiny/MingPanTianJi.vue'
import DestinyRevealMatrix from '@/components/destiny-form/DestinyRevealMatrix.vue'

const router = useRouter()
const menuMode = ref('vertical')
let menuMq = null
const applyMenuMq = () => {
  if (!menuMq) return
  menuMode.value = menuMq.matches ? 'horizontal' : 'vertical'
}

const user = ref({ username: '管理员' })
const active = ref('dashboard')
const baziAnalysis = ref(null)
const baziLoading = ref(false)
const baziError = ref('')
const hourSummary = ref({
  hourTianGan: '',
  hourDiZhi: '',
  hourGanZhi: '',
  actualBirthTime: '',
  longitudeCorrectionMinutes: ''
})
const baziEmptyHint = '暂无八字分析（未录入出生信息或后端未返回 baziAnalysis）'

const stats = ref({
  totalUsers: 0,
  todayLogins: 0,
  vipUsers: 0
})

const mockUsers = ref([
  { username: 'admin', role: '管理员', status: '正常' },
  { username: 'alice', role: '运营', status: '正常' },
  { username: 'bob', role: '用户', status: '冻结' }
])

const mockSettings = ref({
  appName: '一炁文化管理系统',
  apiBaseUrl: 'http://localhost:5000'
})

const readStoredHourSummary = () => {
  const raw = localStorage.getItem('hourSummary')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

const loadBaziAnalysis = async ({ force = false } = {}) => {
  if (!force) {
    const stored = readStoredBaziAnalysis()
    if (stored != null) {
      baziAnalysis.value = stored
      baziError.value = ''
      fillAnalysisForm()
      return
    }
  }

  const userId = user.value?.id || user.value?.userId
  if (!userId) {
    baziError.value = '缺少用户ID，无法获取八字分析'
    baziAnalysis.value = null
    fillAnalysisForm()
    return
  }

  baziLoading.value = true
  baziError.value = ''
  try {
    const res = await analyzeByUser(userId, user.value?.gender)
    const next = res?.data?.baziAnalysis ?? res?.baziAnalysis ?? null
    baziAnalysis.value = next
    persistBaziAnalysis(next)
    fillAnalysisForm()
  } catch (error) {
    baziAnalysis.value = null
    baziError.value = error?.response?.data?.message || error?.message || '八字分析获取失败'
    fillAnalysisForm()
  } finally {
    baziLoading.value = false
  }
}

const analysisForm = ref({
  yearPillar: '',
  monthPillar: '',
  dayPillar: '',
  hourPillar: '',
  majorLuckPillar: '',
  flowYear: '',
  flowMonth: '',
  flowYearMonthPillar: '',
  usefulElement: '',
  unfavorableElement: '',
  dayMaster: '',
  bodyStrengthSnippet: '',
  usefulTenGods: '',
  unfavorableTenGods: '',
  xiYongWuXingPort: '',
  jiShenWuXingPort: '',
  yearNaYin: '',
  monthNaYin: '',
  dayNaYin: '',
  hourNaYin: '',
  extraNaYinText: '',
  wuxingEnergyLine: '',
  twelveStage: '',
  compositeJudgment: '',
  birthDirection: '',
  balanceAxesLine: '',
  stemTenGodsDetail: '',
  hiddenBranchesDetail: '',
  tianGan12EnergyBlock: '',
  extraPillarText: '',
  statusText: '暂无八字分析数据'
})

const fillAnalysisForm = () => {
  const bz = readStoredBaziAnalysis()
  analysisForm.value = mapBaziAnalysisToForm(bz)
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) user.value = JSON.parse(userStr)
  baziAnalysis.value = readStoredBaziAnalysis()
  const cachedHourSummary = readStoredHourSummary()
  if (cachedHourSummary) hourSummary.value = cachedHourSummary

  if (baziAnalysis.value == null) {
    const fromJwt = parseBaziAnalysisFromToken(localStorage.getItem('token'))
    if (fromJwt != null) {
      baziAnalysis.value = fromJwt
      persistBaziAnalysis(fromJwt)
    }
  }

  fillAnalysisForm()
  if (baziAnalysis.value == null) loadBaziAnalysis()

  menuMq = window.matchMedia('(max-width: 767px)')
  applyMenuMq()
  menuMq.addEventListener('change', applyMenuMq)

  // 模拟一下首页展示效果
  stats.value.totalUsers = 1280
  stats.value.todayLogins = 38
  stats.value.vipUsers = 76
})

onUnmounted(() => {
  menuMq?.removeEventListener('change', applyMenuMq)
})

const handleRefreshBazi = async () => {
  await loadBaziAnalysis({ force: true })
  if (!baziError.value) ElMessage.success('天机已重演')
}

const onMenuSelect = (key) => {
  active.value = key
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (e) {}
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('baziAnalysis')
  localStorage.removeItem('fateAnalysis')
  localStorage.removeItem('hourSummary')
  localStorage.removeItem('userAnalysis')
  sessionStorage.removeItem('registerAnalysis')
  ElMessage.success('已退出')
  router.push('/login')
}
</script>

<style scoped>
.yiqi-shell {
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  background: var(--yiqi-black, #050505);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}

.outer {
  height: 100vh;
  height: 100dvh;
}

.aside {
  width: 220px !important;
  flex-shrink: 0;
  background: linear-gradient(180deg, #07141f 0%, #050505 100%);
  border-right: 1px solid rgba(200, 155, 60, 0.12);
  box-shadow: 4px 0 32px rgba(0, 0, 0, 0.35);
}

.brand {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(200, 155, 60, 0.1);
}

.brand-mark {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.2em;
  background: linear-gradient(105deg, #e8d5a8, #c89b3c);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.brand-text {
  font-size: 13px;
  color: #9a9a8e;
  letter-spacing: 0.35em;
}

.menu {
  border-right: none;
  padding: 10px 0;
}

.yiqi-menu :deep(.el-menu-item) {
  margin: 4px 10px;
  border-radius: 8px;
  letter-spacing: 0.08em;
}

.yiqi-menu :deep(.el-menu-item:hover) {
  background: rgba(200, 155, 60, 0.08) !important;
}

.yiqi-menu :deep(.el-menu-item.is-active) {
  background: rgba(200, 155, 60, 0.12) !important;
  border-left: 2px solid #c89b3c;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px !important;
  padding: 0 max(22px, env(safe-area-inset-right, 0px)) 0 max(22px, env(safe-area-inset-left, 0px)) !important;
  padding-top: env(safe-area-inset-top, 0px);
  min-height: calc(56px + env(safe-area-inset-top, 0px));
  background: rgba(11, 28, 44, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(200, 155, 60, 0.12);
  touch-action: manipulation;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
  color: #e8e4dc;
  letter-spacing: 0.2em;
}

.header-sub {
  font-size: 11px;
  color: #6b7280;
  letter-spacing: 0.25em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.welcome {
  font-size: 13px;
  color: #9a9a8e;
}

.welcome em {
  font-style: normal;
  color: #c89b3c;
}

.btn-exit {
  border: 1px solid rgba(255, 107, 74, 0.35) !important;
  background: rgba(255, 107, 74, 0.08) !important;
  color: #ffb4a6 !important;
}

.btn-exit:hover {
  border-color: rgba(255, 107, 74, 0.55) !important;
  background: rgba(255, 107, 74, 0.14) !important;
}

.main {
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(11, 28, 44, 0.9), transparent 55%),
    #050505;
  padding: 20px;
  padding-bottom: max(20px, env(safe-area-inset-bottom, 0px));
  overflow: auto;
  overflow-x: hidden;
  touch-action: pan-y;
}

.yiqi-card {
  margin-bottom: 18px;
  background: rgba(11, 28, 44, 0.55) !important;
  border: 1px solid rgba(200, 155, 60, 0.14) !important;
  border-radius: 14px !important;
  color: #e8e4dc;
  backdrop-filter: blur(8px);
}

.yiqi-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(200, 155, 60, 0.1);
  padding: 14px 18px;
}

.yiqi-card :deep(.el-card__body) {
  padding: 18px;
}

.card-head {
  font-size: 14px;
  letter-spacing: 0.2em;
  color: #c9b896;
}

.mingpan-card {
  position: relative;
  overflow: hidden;
}

.mingpan-card::before {
  content: '';
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle at 50% 50%, rgba(200, 155, 60, 0.06), transparent 45%);
  pointer-events: none;
  animation: mingpan-glow 10s ease-in-out infinite;
}

@keyframes mingpan-glow {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.fate-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.35em;
  color: #e8e4dc;
}

.btn-refresh {
  border: 1px solid rgba(200, 155, 60, 0.35) !important;
  background: rgba(200, 155, 60, 0.1) !important;
  color: #e8d5a8 !important;
}

.btn-refresh:hover {
  border-color: rgba(200, 155, 60, 0.55) !important;
}

.fate-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat {
  text-align: center;
  padding: 22px 12px;
  border-radius: 12px;
  background: rgba(5, 5, 5, 0.35);
  border: 1px solid rgba(200, 155, 60, 0.08);
}

.stat-value {
  font-size: 30px;
  font-weight: 600;
  background: linear-gradient(180deg, #e8d5a8, #c89b3c);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stat-label {
  margin-top: 10px;
  font-size: 12px;
  color: #9a9a8e;
  letter-spacing: 0.12em;
}

.mingge-fate-card :deep(.el-card__body) {
  padding-top: 12px;
  overflow-x: hidden;
}

.yiqi-card :deep(.el-button--primary) {
  border-color: rgba(200, 155, 60, 0.45) !important;
  background: rgba(200, 155, 60, 0.15) !important;
  color: #f0e6d4 !important;
}

.yiqi-card :deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(5, 5, 5, 0.35);
  --el-table-text-color: #e8e4dc;
  --el-table-header-text-color: #c9b896;
  --el-table-border-color: rgba(200, 155, 60, 0.1);
}

@media (prefers-reduced-motion: reduce) {
  .mingpan-card::before,
  .fate-loading {
    animation: none !important;
  }
}

/* <768：侧栏置顶、横向主导航，整页纵向可滚动 */
@media (max-width: 767px) {
  .outer {
    flex-direction: column !important;
    height: auto;
    min-height: 100dvh;
    min-height: 100vh;
  }

  .outer > :deep(.el-aside) {
    width: 100% !important;
    border-right: none;
    border-bottom: 1px solid rgba(200, 155, 60, 0.12);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .brand {
    height: 52px;
  }

  .menu {
    padding: 6px 8px 10px;
  }

  .yiqi-menu :deep(.el-menu-item) {
    margin: 2px 4px;
    flex: 1 1 auto;
    justify-content: center;
    min-width: 0;
    border-left: none !important;
  }

  .yiqi-menu :deep(.el-menu-item.is-active) {
    border-bottom: 2px solid #c89b3c;
    border-radius: 8px 8px 0 0;
  }

  .outer > :deep(.el-container) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .header {
    flex-wrap: wrap;
    height: auto !important;
    min-height: 52px;
    padding: 10px 14px !important;
    gap: 8px;
    backdrop-filter: blur(6px);
  }

  .header-right {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .main {
    padding: 14px 12px;
    flex: 1;
  }

  .yiqi-card {
    backdrop-filter: blur(5px);
  }

  .mingpan-card::before {
    animation: none;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .main {
    padding: 16px 14px;
  }

  .yiqi-card :deep(.el-card__body) {
    padding: 14px;
  }
}
</style>