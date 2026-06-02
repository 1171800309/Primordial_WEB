<template>
  <AuthPageShell
    title="登录"
    subtitle="请输入账号信息"
    :header-link="{ to: '/register', label: '去注册' }"
  >
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="rules"
      class="auth-form"
      @submit.prevent="handleLogin"
    >
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="用户名或手机号"
          size="large"
          autocomplete="username"
          @keyup.enter="handleLogin"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="密码"
          size="large"
          autocomplete="current-password"
          show-password
          @keyup.enter="handleLogin"
        />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="loginForm.remember">记住此终端</el-checkbox>
      </el-form-item>
      <div class="auth-actions">
        <button type="button" class="auth-submit-btn" :disabled="loading" @click="handleLogin">
          {{ loading ? '登录中…' : '登录' }}
        </button>
        <button type="button" class="auth-ghost-btn" @click="goRegister">还没有账号？去注册</button>
      </div>
    </el-form>
  </AuthPageShell>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'
import { extractAuthPayload, saveAuthSession, navigateToHub, skipTokenValidationOnce } from '@/utils/authSession'
import { persistBaziAnalysis } from '@/utils/baziAnalysis'
import { ensureBaziAnalysis } from '@/utils/userData'
import AuthPageShell from '@/components/layout/AuthPageShell.vue'
import { fetchAuthPublicKey } from '@/utils/passwordCipher'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [{ required: true, message: '请输入用户名或手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    })

    const fallbackUser = {
      username: loginForm.username,
      userType: 'member'
    }
    const auth = extractAuthPayload(res, fallbackUser)

    if (!saveAuthSession({ token: auth.token, user: auth.user })) {
      ElMessage.error('登录成功但未返回 token，无法进入导航页')
      return
    }

    if (auth.baziAnalysis != null) {
      persistBaziAnalysis(auth.baziAnalysis)
    } else {
      ensureBaziAnalysis().catch(() => {})
    }

    skipTokenValidationOnce()
    ElMessage.success('欢迎回来')
    loginForm.password = ''
    await navigateToHub(router)
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
}

const goRegister = () => {
  router.push('/register')
}

onMounted(() => {
  fetchAuthPublicKey().catch(() => {})
})
</script>
