<template>
  <div class="home-layout">
    <el-container class="outer">
      <el-aside class="aside">
        <div class="brand">一炁文化管理系统</div>
        <el-menu
          :default-active="active"
          class="menu"
          background-color="#1f2a44"
          text-color="#c7d2fe"
          active-text-color="#ffffff"
          @select="onMenuSelect"
        >
          <el-menu-item index="dashboard">仪表盘</el-menu-item>
          <el-menu-item index="users">用户管理</el-menu-item>
          <el-menu-item index="settings">系统设置</el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="header">
          <div class="header-left">
            <span class="header-title">后台</span>
          </div>
          <div class="header-right">
            <span class="welcome">欢迎，{{ user.username }}</span>
            <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
          </div>
        </el-header>

        <el-main class="main">
          <div v-if="active === 'dashboard'">
            <el-card class="card">
              <template #header>
                <div class="fate-header">
                  <span>八字分析结果</span>
                  <el-button size="small" :loading="fateLoading" @click="handleRefreshFate">手动刷新重算</el-button>
                </div>
              </template>
              <div v-if="fateLoading" class="fate-tip">分析中...</div>
              <div v-else-if="fateError" class="fate-tip error">{{ fateError }}</div>
              <div v-else-if="hourSummary.hourGanZhi" class="hour-summary">
                <span>时柱：{{ hourSummary.hourGanZhi }}</span>
                <span v-if="hourSummary.actualBirthTime">真太阳时：{{ hourSummary.actualBirthTime }}</span>
                <span v-if="hourSummary.longitudeCorrectionMinutes">经度校正：{{ hourSummary.longitudeCorrectionMinutes }} 分钟</span>
              </div>
              <pre v-else-if="fateAnalysis" class="fate-json">{{ formattedFateAnalysis }}</pre>
              <pre v-if="fateAnalysis" class="fate-json">{{ formattedFateAnalysis }}</pre>
              <div v-else class="fate-tip">暂无命理结果</div>
            </el-card>

            <el-card class="card">
              <template #header><span>仪表盘</span></template>
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="stat">
                    <div class="stat-value">{{ stats.totalUsers }}</div>
                    <div class="stat-label">总用户数</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat">
                    <div class="stat-value">{{ stats.todayLogins }}</div>
                    <div class="stat-label">今日登录</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat">
                    <div class="stat-value">{{ stats.vipUsers }}</div>
                    <div class="stat-label">VIP用户</div>
                  </div>
                </el-col>
              </el-row>
            </el-card>

            <el-card class="card" style="margin-top: 16px;">
              <template #header><span>快捷入口（模板占位）</span></template>
              <el-space wrap>
                <el-button type="primary">新增用户</el-button>
                <el-button>导出数据</el-button>
                <el-button>查看日志</el-button>
              </el-space>
            </el-card>
          </div>

          <div v-else-if="active === 'users'">
            <el-card class="card">
              <template #header><span>用户管理（模板占位）</span></template>
              <el-table :data="mockUsers" style="width: 100%;">
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="role" label="角色" />
                <el-table-column prop="status" label="状态" />
              </el-table>
            </el-card>
          </div>

          <div v-else>
            <el-card class="card">
              <template #header><span>系统设置（模板占位）</span></template>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logout } from '@/api/auth'
import { analyzeByUser } from '@/api/fate'

const router = useRouter()
const user = ref({ username: '管理员' })
const active = ref('dashboard')
const fateAnalysis = ref(null)
const fateLoading = ref(false)
const fateError = ref('')
const hourSummary = ref({
  hourTianGan: '',
  hourDiZhi: '',
  hourGanZhi: '',
  actualBirthTime: '',
  longitudeCorrectionMinutes: ''
})
const formattedFateAnalysis = computed(() => JSON.stringify(fateAnalysis.value, null, 2))

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

const readStoredFateAnalysis = () => {
  const raw = localStorage.getItem('fateAnalysis')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

const readStoredHourSummary = () => {
  const raw = localStorage.getItem('hourSummary')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

const persistFateAnalysis = (data) => {
  fateAnalysis.value = data || null
  localStorage.setItem('fateAnalysis', JSON.stringify(fateAnalysis.value))
}

const loadFateAnalysis = async ({ force = false } = {}) => {
  if (!force) {
    const stored = readStoredFateAnalysis()
    if (stored) {
      fateAnalysis.value = stored
      fateError.value = ''
      return
    }
  }

  const userId = user.value?.id || user.value?.userId
  if (!userId) {
    fateError.value = '缺少用户ID，无法获取命理结果'
    fateAnalysis.value = null
    return
  }

  fateLoading.value = true
  fateError.value = ''
  try {
    const res = await analyzeByUser(userId, user.value?.gender)
    const next = res?.data?.fateAnalysis ?? res?.fateAnalysis ?? res?.data ?? null
    persistFateAnalysis(next)
  } catch (error) {
    fateAnalysis.value = null
    fateError.value = error?.response?.data?.message || error?.message || '命理结果获取失败'
  } finally {
    fateLoading.value = false
  }
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) user.value = JSON.parse(userStr)
  fateAnalysis.value = readStoredFateAnalysis()
  const cachedHourSummary = readStoredHourSummary()
  if (cachedHourSummary) hourSummary.value = cachedHourSummary
  if (!fateAnalysis.value) loadFateAnalysis()

  // 模拟一下首页展示效果
  stats.value.totalUsers = 1280
  stats.value.todayLogins = 38
  stats.value.vipUsers = 76
})

const handleRefreshFate = async () => {
  await loadFateAnalysis({ force: true })
  if (!fateError.value) ElMessage.success('命理结果已更新')
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
  ElMessage.success('已退出')
  router.push('/login')
}
</script>

<style scoped>
.outer {
  height: 100vh;
}

.aside {
  background-color: #1f2a44;
}

.brand {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: #ffffff;
  font-weight: 700;
}

.menu {
  border-right: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid #edf1f7;
}

.header-title {
  font-weight: 700;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.welcome {
  color: #374151;
}

.main {
  background: #f6f7fb;
  padding: 16px;
}

.card {
  margin-bottom: 16px;
}

.fate-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fate-tip {
  color: #6b7280;
}

.fate-tip.error {
  color: #ef4444;
}

.fate-json {
  margin: 0;
  max-height: 320px;
  overflow: auto;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.hour-summary {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  color: #374151;
}

.stat {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  margin-top: 10px;
  color: #666;
}
</style>