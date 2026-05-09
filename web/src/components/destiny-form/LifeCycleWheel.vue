<template>
  <section class="lcw" :class="{ 'lcw--ready': ready, 'lcw--mobile': isMobile }" :style="{ '--sg': stagger }">
    <header class="lcw-head">
      <h3 class="lcw-title">气运轮回</h3>
      <p class="lcw-sub">十二宫位 · 当前气运</p>
    </header>
    <div class="lcw-wheel">
      <svg class="lcw-svg" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(200,155,60,0.12)" stroke-width="1" />
        <g v-for="(name, i) in stages" :key="name">
          <path
            :d="segmentPath(i)"
            :fill="i === activeIndex ? 'rgba(77,163,255,0.22)' : 'rgba(11,28,44,0.55)'"
            :stroke="i === activeIndex ? 'rgba(77,163,255,0.55)' : 'rgba(200,155,60,0.14)'"
            stroke-width="0.6"
            class="lcw-seg"
            :class="{ 'lcw-seg--on': i === activeIndex }"
          />
          <text
            :x="labelPos(i).x"
            :y="labelPos(i).y"
            class="lcw-txt"
            :class="{ 'lcw-txt--on': i === activeIndex }"
            text-anchor="middle"
            dominant-baseline="middle"
          >{{ short(name) }}</text>
        </g>
        <circle cx="100" cy="100" r="22" class="lcw-core" />
        <text x="100" y="104" class="lcw-core-t" text-anchor="middle">{{ coreLabel }}</text>
      </svg>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { TWELVE_STAGES } from '@/utils/destinyModel'

const props = defineProps({
  stage: { type: String, default: '' },
  ready: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  stagger: { type: Number, default: 0 }
})

const stages = TWELVE_STAGES

const activeIndex = computed(() => {
  const s = String(props.stage || '')
  for (let i = 0; i < stages.length; i++) {
    if (s.includes(stages[i])) return i
  }
  return -1
})

const coreLabel = computed(() => {
  const i = activeIndex.value
  return i >= 0 ? stages[i] : '炁'
})

const short = (name) => (name.length > 1 ? name[0] : name)

const segmentPath = (i) => {
  const n = 12
  const r0 = 34
  const r1 = 76
  const a0 = ((i / n) * 360 - 90) * (Math.PI / 180)
  const a1 = (((i + 1) / n) * 360 - 90) * (Math.PI / 180)
  const x0 = 100 + r0 * Math.cos(a0)
  const y0 = 100 + r0 * Math.sin(a0)
  const x1 = 100 + r1 * Math.cos(a0)
  const y1 = 100 + r1 * Math.sin(a0)
  const x2 = 100 + r1 * Math.cos(a1)
  const y2 = 100 + r1 * Math.sin(a1)
  const x3 = 100 + r0 * Math.cos(a1)
  const y3 = 100 + r0 * Math.sin(a1)
  const large = 0
  return `M ${x0} ${y0} L ${x1} ${y1} A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r0} ${r0} 0 ${large} 0 ${x0} ${y0} Z`
}

const labelPos = (i) => {
  const n = 12
  const mid = (((i + 0.5) / n) * 360 - 90) * (Math.PI / 180)
  const r = 56
  return { x: 100 + r * Math.cos(mid), y: 100 + r * Math.sin(mid) }
}
</script>

<style scoped>
.lcw {
  position: relative;
  padding: 14px 12px 18px;
  border-radius: 14px;
  border: 1px solid rgba(200, 155, 60, 0.22);
  background: linear-gradient(180deg, rgba(11, 28, 44, 0.85), rgba(5, 5, 5, 0.75));
  opacity: 0;
  transform: translate3d(0, 16px, 0);
  transition:
    opacity 0.65s ease,
    transform 0.65s ease;
  transition-delay: calc(var(--sg) * 55ms);
}

.lcw--ready {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.lcw-head {
  text-align: center;
  margin-bottom: 8px;
}

.lcw-title {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
  color: #e8d5a8;
}

.lcw-sub {
  margin: 6px 0 0;
  font-size: 10px;
  color: #6b7280;
  letter-spacing: 0.16em;
}

.lcw-wheel {
  max-width: 260px;
  margin: 0 auto;
}

.lcw-svg {
  width: 100%;
  height: auto;
  display: block;
}

.lcw-txt {
  font-size: 9px;
  fill: #9a9a8e;
  pointer-events: none;
}

.lcw-txt--on {
  fill: #e8e4dc;
  font-weight: 600;
}

.lcw-seg--on {
  filter: drop-shadow(0 0 6px rgba(77, 163, 255, 0.35));
}

.lcw-core {
  fill: rgba(5, 5, 5, 0.88);
  stroke: rgba(200, 155, 60, 0.35);
  stroke-width: 1;
}

.lcw-core-t {
  font-size: 11px;
  fill: #c9b896;
  letter-spacing: 0.2em;
}

.lcw--mobile .lcw-seg {
  opacity: 0.92;
}

@media (prefers-reduced-motion: reduce) {
  .lcw {
    transition: opacity 0.3s ease;
    transform: none !important;
  }
}
</style>
