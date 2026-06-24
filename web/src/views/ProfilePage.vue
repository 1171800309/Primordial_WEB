<template>
  <div class="prototype-page profile-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <canvas ref="canvasRef" id="bg-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">一炁逆熵.炁运录<span class="en">YIQI</span></div>
      </router-link>
    </div>

    <a href="/hub" class="back-btn" @click.prevent="goHub">← 返回中枢</a>

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
import { useBackToHub } from '@/composables/useBackToHub'
import { useDustCanvas } from '@/composables/useDustCanvas'
import { clearSession } from '@/utils/session'
import '@/styles/prototype-base.css'

const canvasRef = ref(null)
const { loaded } = usePageTransition(500)
useDustCanvas(canvasRef)

const router = useRouter()
const goHub = useBackToHub()

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
  padding: 120px 5% 100px;
  text-align: center;
}

.profile-logo {
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
}

.profile-title {
  font-family: var(--font-serif, 'Noto Serif SC', serif);
  font-size: 28px;
  letter-spacing: 0.2em;
  color: var(--gold-light, #eadec7);
  margin-bottom: 8px;
}

.profile-greeting {
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 32px;
}

.logout-btn {
  padding: 12px 28px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}
</style>
