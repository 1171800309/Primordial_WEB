<template>
  <section class="block wuxing-block">
    <h3 class="block-title"><span class="title-glow">五行能量阵</span></h3>
    <div class="wuxing-stage" :class="ringWrapClass">
      <div
        class="ring-outer"
        :class="{
          'ring-outer--mobile': isMobile,
          [`dominant--${dominantWx}`]: dominantWx
        }"
      >
        <div class="ring-glow" :style="glowStyle" />
        <div
          class="ring-chart"
          :style="{
            background: conicGradient,
            '--spin': isMobile ? '72s' : '48s'
          }"
        />
        <div class="ring-inner-mask" />
        <div class="taiji-core" aria-hidden="true">
          <span class="taiji-symbol">☯</span>
        </div>
        <!-- 按数值动态粒子数量 / 光强 -->
        <span
          v-for="(p, i) in particles"
          :key="i"
          class="wx-particle"
          :style="p.style"
        />
      </div>
      <ul class="wuxing-legend">
        <li
          v-for="k in feOrder"
          :key="k"
          class="legend-item"
          :class="{
            'legend--dim': (feTotals[k] || 0) <= 0,
            'legend--xi': xiYong && String(xiYong).includes(k),
            'legend--ji': jiShen && String(jiShen).includes(k)
          }"
        >
          <i class="legend-dot" :style="legendDotStyle(k)" />
          <span class="legend-name">{{ k }}</span>
          <span class="legend-val">{{ feTotals[k] }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  parseFiveElementsTotal,
  buildWuxingConicGradient,
  getWuxingIntensities,
  getParticleCountForElement,
  getDominantWuXing,
  WUXING_COLORS
} from '@/utils/destinyModel'

const props = defineProps({
  bazi: { type: Object, default: null },
  xiYong: { type: String, default: '' },
  jiShen: { type: String, default: '' },
  isMobile: { type: Boolean, default: false }
})

const fePack = computed(() => parseFiveElementsTotal(props.bazi))
const feTotals = computed(() => ({ 金: fePack.value.金, 木: fePack.value.木, 水: fePack.value.水, 火: fePack.value.火, 土: fePack.value.土 }))
const feOrder = computed(() => fePack.value.order || ['金', '木', '水', '火', '土'])
const conicGradient = computed(() => buildWuxingConicGradient(feTotals.value))
const dominantWx = computed(() => getDominantWuXing(feTotals.value))

const intensities = computed(() => getWuxingIntensities(feTotals.value).intensities)

const findWxInString = (s) => {
  const str = String(s || '')
  for (const ch of ['金', '木', '水', '火', '土']) {
    if (str.includes(ch)) return ch
  }
  return ''
}

const ringWrapClass = computed(() => {
  const ch = findWxInString(props.xiYong)
  return ch ? `xi-accent--${ch}` : ''
})

const glowStyle = computed(() => {
  const c = findWxInString(props.xiYong)
  if (!c) return {}
  const map = {
    金: 'rgba(200,155,60,0.35)',
    木: 'rgba(79,175,108,0.25)',
    水: 'rgba(77,163,255,0.25)',
    火: 'rgba(255,107,74,0.28)',
    土: 'rgba(154,123,92,0.22)'
  }
  return { background: `radial-gradient(circle, ${map[c]}, transparent 65%)` }
})

const particles = computed(() => {
  const list = []
  const order = feOrder.value
  const mobile = props.isMobile
  order.forEach((wx) => {
    const inten = intensities.value[wx] || 0
    const n = getParticleCountForElement(inten, mobile)
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2
      const r = 38 + Math.random() * 52
      const x = 50 + Math.cos(ang) * r * 0.45
      const y = 50 + Math.sin(ang) * r * 0.45
      const d = inten < 0.08 ? 0.15 : 0.35 + inten * 0.5
      list.push({
        style: {
          left: `${x}%`,
          top: `${y}%`,
          opacity: d,
          background: WUXING_COLORS[wx] || '#fff',
          animationDuration: `${8 + inten * 6}s`
        }
      })
    }
  })
  return list
})

const legendDotStyle = (k) => ({
  background: WUXING_COLORS[k],
  opacity: (feTotals.value[k] || 0) <= 0 ? 0.25 : 0.85 + (intensities.value[k] || 0) * 0.15
})
</script>

<style scoped>
.block {
  margin-bottom: 28px;
}

.block-title {
  margin: 0 0 14px;
  font-size: clamp(12px, 2.8vw, 13px);
  font-weight: 500;
  letter-spacing: 0.28em;
  color: #9a9a8e;
}

.title-glow {
  color: #c9b896;
  text-shadow: 0 0 12px rgba(200, 155, 60, 0.2);
}

.wuxing-stage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: clamp(16px, 4vw, 28px) clamp(20px, 5vw, 36px);
}

.ring-outer {
  position: relative;
  width: min(200px, 70vw);
  height: min(200px, 70vw);
  flex-shrink: 0;
}

.ring-outer--mobile {
  width: min(200px, 70vw);
  height: min(200px, 70vw);
  transform: scale(0.92);
  transform-origin: center;
}

.ring-outer.dominant--金 {
  box-shadow: 0 0 0 1px rgba(200, 155, 60, 0.22) inset, 0 0 28px rgba(200, 155, 60, 0.12);
}
.ring-outer.dominant--木 {
  box-shadow: 0 0 0 1px rgba(79, 175, 108, 0.22) inset, 0 0 28px rgba(79, 175, 108, 0.1);
}
.ring-outer.dominant--水 {
  box-shadow: 0 0 0 1px rgba(77, 163, 255, 0.22) inset, 0 0 28px rgba(77, 163, 255, 0.1);
}
.ring-outer.dominant--火 {
  box-shadow: 0 0 0 1px rgba(255, 107, 74, 0.22) inset, 0 0 28px rgba(255, 107, 74, 0.1);
}
.ring-outer.dominant--土 {
  box-shadow: 0 0 0 1px rgba(154, 123, 92, 0.25) inset, 0 0 28px rgba(154, 123, 92, 0.1);
}

@media (max-width: 767px) {
  .ring-outer--mobile {
    transform: scale(0.88);
  }

  .ring-outer.dominant--金,
  .ring-outer.dominant--木,
  .ring-outer.dominant--水,
  .ring-outer.dominant--火,
  .ring-outer.dominant--土 {
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  }
}

.ring-glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  animation: ring-pulse 4s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

.ring-chart {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: ring-rotate var(--spin, 48s) linear infinite;
  will-change: transform;
}

@keyframes ring-rotate {
  to {
    transform: rotate(360deg);
  }
}

.ring-inner-mask {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, #050505 0 32%, transparent 33%);
  pointer-events: none;
}

.taiji-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: clamp(56px, 16vw, 72px);
  height: clamp(56px, 16vw, 72px);
  margin: calc(clamp(56px, 16vw, 72px) / -2) 0 0 calc(clamp(56px, 16vw, 72px) / -2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 35% 35%, #1a2836, #050505);
  border: 1px solid rgba(200, 155, 60, 0.25);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.taiji-symbol {
  font-size: clamp(22px, 6vw, 28px);
  opacity: 0.85;
  animation: taiji-breathe 5s ease-in-out infinite;
}

@keyframes taiji-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.75;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

.wx-particle {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  pointer-events: none;
  animation: float-particle linear infinite;
}

@keyframes float-particle {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(0, -10px, 0) scale(0.6);
  }
}

.wuxing-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
  min-width: min(140px, 42vw);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(12px, 3vw, 13px);
  color: #d4cfc4;
  transition: opacity 0.3s ease, filter 0.3s ease;
}

.legend--dim {
  opacity: 0.45;
  filter: grayscale(0.4);
}

.legend--xi {
  text-shadow: 0 0 10px rgba(200, 155, 60, 0.35);
}

.legend--ji {
  animation: ji-flicker 2.5s ease-in-out infinite;
}

@keyframes ji-flicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.65;
  }
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-val {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  color: #c9b896;
}

@media (prefers-reduced-motion: reduce) {
  .ring-glow,
  .ring-chart,
  .taiji-symbol,
  .wx-particle,
  .legend--ji {
    animation: none !important;
  }
}
</style>
