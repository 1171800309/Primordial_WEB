<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">一炁文化</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="用户名/邮箱/手机号"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码"
            prefix-icon="Lock"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            :loading="loading" 
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
          <el-button class="register-btn" @click="goRegister">去注册</el-button>
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

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
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

      const token =
        res?.data?.token ||
        res?.token ||
        res?.data?.accessToken ||
        res?.accessToken ||
        ''
      const user = res?.data?.user || res?.user || { username: loginForm.username }

      if (!token) {
        ElMessage.error('登录成功但未返回 token')
        return
      }

      clearSession()
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      touchSession()
      ElMessage.success('登录成功')
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #1a1a2e;
  font-size: 28px;
  font-weight: 600;
}

.login-btn {
  width: 100%;
  margin-top: 10px;
}

.register-btn {
  width: 100%;
  margin-top: 10px;
}
</style>