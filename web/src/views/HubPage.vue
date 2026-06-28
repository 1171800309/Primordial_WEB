<template>
  <div class="prototype-page hub-page">
    <div class="page-transition" :class="{ loaded }">
      <img :src="logoUrl" alt="一炁" class="transition-logo ink-blend" />
    </div>

    <canvas ref="canvasRef" id="core-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">一炁逆熵.炁运录<span class="en">YIQI</span></div>
      </router-link>
      <router-link to="/profile" class="top-right-user">个人中心</router-link>
    </div>

    <div class="main-container">
      <section class="welcome-header" aria-label="炁运录欢迎区">
        <p>欢迎来到炁运录</p>
      </section>

      <div class="orbs-grid" aria-label="一炁功能导航">
        <div
          v-for="(planet, i) in featurePlanets"
          :key="planet.name"
          class="orb-wrapper"
          :class="`delay-${i + 1}`"
        >
          <button
            type="button"
            class="nav-orb"
            :class="{ 'nav-orb--locked': planet.locked }"
            :aria-label="planet.locked ? `${planet.title}暂未开放` : `进入${planet.title}`"
            :aria-disabled="planet.locked ? 'true' : 'false'"
            :disabled="planet.locked"
            @click="goPlanet(planet)"
          >
            <span class="orb-shading" />
            <span class="orb-content">
              <span class="card-title">{{ planet.title }}</span>
              <span v-if="planet.descLines?.length" class="card-desc">
                <span v-for="line in planet.descLines" :key="line">{{ line }}</span>
              </span>
              <span v-if="!planet.locked" class="card-btn">进入 <span>→</span></span>
            </span>
          </button>
        </div>
      </div>
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

const featurePlanets = [
  {
    name: 'xiantian',
    to: { name: 'xiantian' },
    title: '先天.恒.炁域',
    descLines: [
      '你与生俱来的恒久不变的“先天之炁”',
      '其炁之数、炁之性对应的你是谁？',
      '真正了解自己，才能面对未知'
    ]
  },
  {
    name: 'bianqi',
    to: { name: 'bianqi' },
    title: '后天.变.炁域',
    descLines: [
      '你人生之路所遭遇的“变化之炁”',
      '大运、流年，对你有怎样的影响',
      '在不同的炁场下要做如何的决策'
    ]
  },
  {
    name: 'bianqi-report',
    to: { name: 'bianqi-report' },
    title: '大运.流年.报告',
    descLines: [
      '读取后天变化里的深层文本',
      '大运深度分析与流年关键提示',
      '看见当下炁场的具体提醒'
    ]
  },
  {
    name: 'qixiangtai',
    to: { name: 'qixiangtai' },
    title: '炁象台',
    descLines: [
      '记录你人生的起伏',
      '了解你人性的状态',
      '具象化你的炁场'
    ]
  },
  {
    name: 'chaos-explore',
    to: { name: 'chaos-explore' },
    title: '混沌.探索域',
    descLines: [
      '进入混沌地带',
      '探索未定型的测试炁场',
      '寻找尚未显化的可能'
    ]
  },
  {
    name: 'x-domain',
    title: 'x炁域',
    locked: true,
    descLines: []
  }
]

const goPlanet = async (planet) => {
  if (planet.locked) return
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
