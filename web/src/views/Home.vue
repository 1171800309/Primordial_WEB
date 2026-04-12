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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logout } from '@/api/auth'

const router = useRouter()
const user = ref({ username: '管理员' })
const active = ref('dashboard')

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

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) user.value = JSON.parse(userStr)

  // 模拟一下首页展示效果
  stats.value.totalUsers = 1280
  stats.value.todayLogins = 38
  stats.value.vipUsers = 76
})

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