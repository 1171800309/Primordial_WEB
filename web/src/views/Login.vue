<template>
  <div class="yiqi-auth-page">
    <MysticCanvasBackground />
    <div class="yiqi-auth-vignette" />
    <div class="yiqi-glass-panel login-glass">
      <div class="yiqi-title-block">
        <h1 class="yiqi-brand">一炁文化</h1>
        <p class="yiqi-subtitle">天机命盘系统</p>
      </div>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="yiqi-login-form">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="命盘编号（用户名或手机号）"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="天机密钥（密码）"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住此终端</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="yiqi-btn-ritual login-primary"
            @click="handleLogin"
          >
            {{ loading ? '推演中…' : '启动阵法' }}
          </el-button>
          <el-button class="yiqi-btn-ghost" @click="goRegister">开启命格</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'
import { touchSession, clearSession } from '@/utils/session'
import MysticCanvasBackground from '@/components/MysticCanvasBackground.vue'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [{ required: true, message: '请输入命盘编号（用户名或手机号）', trigger: 'blur' }],
  password: [{ required: true, message: '请输入天机密钥', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await login({
        username: loginForm.username,
        password: loginForm.password
      })

      const payload = res?.data || res || {}
      const token =
        payload?.token ||
        res?.token ||
        payload?.accessToken ||
        res?.accessToken ||
        ''
      const user =
        payload?.user ||
        res?.user || {
          id: payload?.id,
          username: payload?.username || loginForm.username,
          userType: payload?.userType || 'member',
          gender: payload?.gender
        }
      const baziAnalysis = payload?.baziAnalysis ?? null
      const hourSummary = {
        hourTianGan: payload?.hourTianGan || '',
        hourDiZhi: payload?.hourDiZhi || '',
        hourGanZhi: payload?.hourGanZhi || '',
        actualBirthTime: payload?.actualBirthTime || '',
        longitudeCorrectionMinutes: payload?.longitudeCorrectionMinutes || ''
      }

      if (!token) {
        ElMessage.error('登录成功但未返回 token')
        return
      }

      clearSession()
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('baziAnalysis', JSON.stringify(baziAnalysis))
      localStorage.setItem('hourSummary', JSON.stringify(hourSummary))
      touchSession()
      ElMessage.success('天机已应')
      router.push('/index')
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error?.response?.data?.error ||
        error?.message ||
        '登录失败'
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  })
}

const goRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-glass {
  max-width: 400px;
}

.yiqi-login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-primary {
  margin-top: 4px;
}
</style>
