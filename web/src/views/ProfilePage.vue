<template>
  <div class="prototype-page profile-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <canvas ref="canvasRef" id="bg-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <span class="brand-text">一炁文化</span>
      </router-link>
    </div>

    <router-link to="/hub" class="back-btn">← 返回中枢</router-link>

    <main class="profile-main">
      <img :src="logoUrl" alt="一炁" class="profile-logo ink-blend" />
      <h1 class="profile-title">个人中心</h1>
      <p class="profile-greeting">欢迎回来，<span>{{ displayName }}</span></p>

      <button type="button" class="logout-btn" @click="logout">退出登录</button>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '@/assets/logo.png'
import { usePageTransition } from '@/composables/usePageTransition'
import { useDustCanvas } from '@/composables/useDustCanvas'
import { clearSession } from '@/utils/session'
import '@/styles/prototype-base.css'

const canvasRef = ref(null)
const { loaded } = usePageTransition(500)
useDustCanvas(canvasRef)

const router = useRouter()

const displayName = computed(() => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return '炁友'
    const user = JSON.parse(raw)
    return user?.username || user?.name || user?.nickname || '炁友'
  } catch {
    return '炁友'
  }
})

const logout = () => {
  clearSession()
  router.push('/login')
}
</script>

<style scoped>
#bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.6;
  pointer-events: none;
}

.profile-main {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 5% 80px;
  text-align: center;
}

.profile-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 32px;
}

.profile-title {
  font-family: var(--font-serif);
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 300;
  letter-spacing: 0.2em;
  margin-bottom: 24px;
}

.profile-greeting {
  font-size: 15px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  margin-bottom: 48px;
}

.profile-greeting span {
  color: var(--gold-light);
}

.logout-btn {
  padding: 14px 48px;
  border-radius: 30px;
  border: 1px solid rgba(234, 222, 199, 0.3);
  background: rgba(234, 222, 199, 0.08);
  color: var(--gold-light);
  font-family: var(--font-serif);
  font-size: 15px;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: all 0.4s ease;
}

.logout-btn:hover {
  background: var(--gold-light);
  color: var(--bg-color);
  box-shadow: 0 0 24px rgba(234, 222, 199, 0.35);
}
</style>
