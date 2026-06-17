<template>
  <div class="prototype-page hub-page">
    <div class="page-transition" :class="{ loaded }">
      <img :src="logoUrl" alt="一炁" class="transition-logo ink-blend" />
    </div>

    <canvas ref="canvasRef" id="core-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">一炁<span class="en">YIQI</span></div>
      </router-link>
      <router-link to="/profile" class="top-right-user">个人中心</router-link>
    </div>

    <div class="solar-system" aria-label="一炁功能导航">
      <button
        v-for="(planet, i) in planets"
        :key="planet.name"
        :ref="setPlanetRef"
        type="button"
        class="planet-wrapper"
        :aria-label="`进入${planet.title}`"
        @click="goPlanet(planet)"
        @focus="focusPlanet(i)"
        @mouseenter="focusPlanet(i)"
      >
        <span class="planet-sphere" :class="`glow-${planet.tone}`" />
        <span class="planet-content">
          <span class="planet-title" :class="`planet-title--${planet.tone}`">{{ planet.title }}</span>
          <span class="planet-desc">{{ planet.desc }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue'
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

const planets = [
  {
    name: 'xiantian',
    to: { name: 'xiantian' },
    title: '先天 . 恒炁域',
    desc: '你与生俱来的恒久之炁，不可磨灭。',
    tone: 'white'
  },
  {
    name: 'bianqi',
    to: { name: 'bianqi' },
    title: '后天 . 变炁域',
    desc: '大运流年流转。推演进退法则。',
    tone: 'white'
  },
  {
    name: 'qixiangtai',
    to: { name: 'qixiangtai' },
    title: '炁象台',
    desc: '记录人生的潮汐，展现灵魂能量场。',
    tone: 'grey'
  },
  {
    name: 'chaos-explore',
    to: { name: 'chaos-explore' },
    title: '混沌探索',
    desc: '混沌地带。未来将用于测试娱乐。',
    tone: 'grey'
  },
  {
    name: 'wanqi',
    to: { name: 'wanqi' },
    title: '幸运星',
    desc: '触碰随机恩赐，获取今日专属指引。',
    tone: 'gold'
  }
]

const planetRefs = ref([])
const planetCount = planets.length
const pauseDuration = 4000
let raf = 0
let mode = 'moving'
let pauseTimer = 0
let currentProgress = 0
let targetProgress = 0
let lastTime = 0

const setPlanetRef = (el) => {
  if (el) planetRefs.value.push(el)
}

onBeforeUpdate(() => {
  planetRefs.value = []
})

const focusPlanet = (index) => {
  mode = 'moving'
  pauseTimer = 0

  let currentVal = (index + targetProgress) % planetCount
  if (currentVal < 0) currentVal += planetCount

  let diff = (planetCount - currentVal) % planetCount
  if (diff > planetCount / 2) diff -= planetCount
  targetProgress += diff
}

const renderSystem = (time) => {
  const dt = lastTime ? time - lastTime : 16
  lastTime = time

  if (Math.abs(currentProgress - targetProgress) < 0.005) {
    currentProgress = targetProgress
    if (mode === 'moving') {
      mode = 'paused'
      pauseTimer = 0
    }
    if (mode === 'paused') {
      pauseTimer += dt
      if (pauseTimer > pauseDuration) {
        targetProgress += 1
        mode = 'moving'
      }
    }
  } else {
    currentProgress += (targetProgress - currentProgress) * (dt * 0.004)
  }

  const isWide = window.innerWidth > 800
  const rx = window.innerWidth * (isWide ? 0.42 : 0.48)
  const ry = window.innerHeight * (isWide ? 0.18 : 0.14)
  const breathTime = time * 0.0015

  planetRefs.value.forEach((planetEl, i) => {
    let val = (i + currentProgress) % planetCount
    if (val < 0) val += planetCount

    let t = val
    if (t > planetCount / 2) t -= planetCount

    const x = rx * Math.sin(t * (Math.PI / 6))
    const z = Math.cos(t * (Math.PI / 6))
    const baseY = -ry * (1 - z) + ry * 0.2
    const floatY = Math.sin(breathTime * 1.5 + i) * (isWide ? 15 : 8)
    const breatheScale = Math.sin(breathTime * 1.8 + i) * 0.03
    const scale = 0.7 + 0.55 * z + breatheScale
    const opacity = Math.max(0, 1 - Math.abs(t / 2.4) ** 4)

    planetEl.style.transform = `translate(${x}px, ${baseY + floatY}px) scale(${scale})`
    planetEl.style.zIndex = `${Math.floor(z * 100)}`
    planetEl.style.opacity = `${opacity}`

    planetEl.classList.toggle('active', Math.abs(t) < 0.1 && mode === 'paused')
  })

  raf = requestAnimationFrame(renderSystem)
}

onMounted(() => {
  raf = requestAnimationFrame(renderSystem)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
})

const goPlanet = async (planet) => {
  loaded.value = false
  await router.push(planet.to)
}
</script>

<style scoped>
#core-canvas {
  position: fixed;
  inset: 0;
  z-index: 1;
  opacity: 0.72;
  pointer-events: none;
}
</style>
