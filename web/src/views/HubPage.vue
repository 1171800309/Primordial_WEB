<template>
  <div class="prototype-page hub-page">
    <div class="page-transition" :class="{ loaded }">
      <img :src="logoUrl" alt="一炁" class="transition-logo ink-blend" />
    </div>

    <canvas ref="canvasRef" id="core-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">一炁文化<span class="en">YIQI</span></div>
      </router-link>
      <router-link to="/profile" class="top-right-user">个人中心</router-link>
    </div>

    <div class="main-container">
      <div class="welcome-header fade-up">
        <img :src="logoUrl" alt="一炁 Logo" class="center-logo ink-blend" />
        <h1>欢迎来到一炁文化</h1>
      </div>

      <div class="orbs-grid">
        <div v-for="(orb, i) in orbs" :key="orb.name" :class="['orb-wrapper', 'fade-up', `delay-${i + 1}`]">
          <a href="#" class="nav-orb" @click.prevent="goOrb(orb)">
            <div class="orb-shading" />
            <div class="orb-content">
              <div class="card-title">{{ orb.title }}</div>
              <div class="card-desc" v-html="orb.desc" />
              <div class="card-btn">进入 <span>→</span></div>
            </div>
          </a>
        </div>
      </div>

      <div class="footer-note fade-up delay-3">仅供娱乐</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '@/assets/logo.png'
import { usePageTransition } from '@/composables/usePageTransition'
import { useOrbitCanvas } from '@/composables/useOrbitCanvas'
import '@/styles/prototype-base.css'
import '@/styles/pages/导航页.css'

const router = useRouter()
const canvasRef = ref(null)
const { loaded } = usePageTransition(1000)
useOrbitCanvas(canvasRef)

const orbs = [
  {
    name: 'xiantian',
    to: { name: 'xiantian' },
    title: '先天 . 恒 . 炁域',
    desc: '你与生俱来的恒久不变的"先天之炁"<br />其炁之数、炁之性对应的你是谁？<br />真正了解自己，才能面对未知<br />...'
  },
  {
    name: 'bianqi',
    to: { name: 'bianqi' },
    title: '后天 . 变 . 炁域',
    desc: '你人生之路所遭遇的"变化之炁"<br />大运、流年，对你有怎样的影响<br />在不同的炁场下要做如何的决策<br />...'
  },
  {
    name: 'qixiangtai',
    to: { name: 'qixiangtai' },
    title: '炁象台',
    desc: '记录你人生的起伏<br />了解你人性的状态<br />具象化你的炁场<br />...'
  }
]

const goOrb = async (orb) => {
  loaded.value = false
  await router.push(orb.to)
}
</script>

<style scoped>
.hub-page .top-right-user {
  text-decoration: none;
  font-size: 14px;
  color: var(--text-muted);
  letter-spacing: 0.15em;
  transition: all 0.4s ease;
  pointer-events: auto;
}
.hub-page .top-right-user:hover {
  color: var(--gold-light);
  transform: translateY(-2px);
}
#core-canvas {
  position: fixed;
  inset: 0;
  z-index: -1;
  opacity: 0.5;
  pointer-events: none;
}

.hub-page a.nav-orb {
  text-decoration: none;
  color: inherit;
}
</style>
