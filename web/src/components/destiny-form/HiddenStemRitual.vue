<template>
  <section v-if="keys.length" class="hsr" :class="{ 'hsr--ready': ready, 'hsr--mobile': isMobile }" :style="{ '--sg': stagger }">
    <header class="hsr-head">
      <h3 class="hsr-title">地支法藏</h3>
      <p class="hsr-sub">地支展开法阵 · 点选显化</p>
    </header>

    <div class="hsr-stage" :class="{ 'hsr-stage--summon': summonOpen }">
      <!-- 第一层：星空 / 雾 -->
      <div class="hsr-layer hsr-stars" aria-hidden="true" />
      <div class="hsr-layer hsr-mist" aria-hidden="true" />
      <div class="hsr-layer hsr-particles" aria-hidden="true" />

      <!-- 第二层：法阵 + 四支 -->
      <div class="hsr-formation">
        <div class="hsr-ring" aria-hidden="true" />
        <div class="hsr-ring hsr-ring--slow" aria-hidden="true" />

        <EarthBranchNode
          v-for="slot in branchSlots"
          :key="slot.key"
          :class="slot.gridClass"
          :branch-key="slot.key"
          :di-zhi="diZhiFor(slot.key)"
          :position="slot.position"
          :active="openKey === slot.key"
          :is-mobile="isMobile"
          :bazi="bazi"
          @activate="onSelectBranch"
        />

        <div class="hsr-taiji" aria-hidden="true">
          <span>☯</span>
        </div>
      </div>
    </div>

    <HiddenStemSummonLayer
      :visible="summonOpen"
      :branch-label="openKey"
      :branch-char="diZhiFor(openKey)"
      :stems="summonStems"
      :is-mobile="isMobile"
      @close="onCloseSummon"
    />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import EarthBranchNode from '@/components/destiny/EarthBranchNode.vue'
import HiddenStemSummonLayer from '@/components/destiny/HiddenStemSummonLayer.vue'
import { getDiZhiFromBaziForBranchRow } from '@/utils/destinyModel'

const props = defineProps({
  json: { type: String, default: '' },
  bazi: { type: Object, default: null },
  ready: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  stagger: { type: Number, default: 0 }
})

const openKey = ref('')

const parsed = computed(() => {
  const raw = String(props.json || '').trim()
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
})

const keys = computed(() => {
  const o = parsed.value
  if (!o || typeof o !== 'object') return []
  return Object.keys(o)
})

const branchSlots = computed(() => {
  const ks = keys.value
  const order = [
    { test: (k) => /年/.test(String(k)), position: 'year', gridClass: 'hsr-pos-year' },
    { test: (k) => /月/.test(String(k)), position: 'month', gridClass: 'hsr-pos-month' },
    { test: (k) => /时/.test(String(k)), position: 'hour', gridClass: 'hsr-pos-hour' },
    { test: (k) => /日/.test(String(k)), position: 'day', gridClass: 'hsr-pos-day' }
  ]
  const out = []
  for (const o of order) {
    const key = ks.find((k) => o.test(k))
    if (key) out.push({ key, position: o.position, gridClass: o.gridClass })
  }
  for (const k of ks) {
    if (!out.some((x) => x.key === k)) {
      out.push({ key: k, position: 'extra', gridClass: 'hsr-pos-extra' })
    }
  }
  return out
})

const summonOpen = computed(() => Boolean(openKey.value))

const pick = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return ''
  for (const kk of keys) {
    const x = obj[kk]
    if (x != null && x !== '') return typeof x === 'object' ? '' : String(x)
  }
  return ''
}

const normalizeStemRow = (row) => {
  if (row == null || typeof row !== 'object') return null
  const stem =
    pick(row, ['藏干', '天干', '干', 'cangGan']) ||
    (typeof row.藏干 === 'string' ? row.藏干 : '') ||
    (typeof row.干 === 'string' ? row.干 : '')
  const god = pick(row, ['十神', '神', 'shiShen']) || ''
  if (!stem) return null
  return { stem, god }
}

const rowsFromValue = (val) => {
  if (val == null) return []
  if (Array.isArray(val)) return val.map(normalizeStemRow).filter(Boolean)
  if (typeof val === 'object') {
    const rows = []
    for (const [, v] of Object.entries(val)) {
      if (Array.isArray(v)) rows.push(...v.map(normalizeStemRow).filter(Boolean))
      else {
        const one = normalizeStemRow(v)
        if (one) rows.push(one)
      }
    }
    if (rows.length) return rows
    const one = normalizeStemRow(val)
    return one ? [one] : []
  }
  return []
}

const summonStems = computed(() => {
  const k = openKey.value
  if (!k || !parsed.value) return []
  return rowsFromValue(parsed.value[k])
})

const diZhiFor = (k) => {
  if (!k) return ''
  const fromBazi = getDiZhiFromBaziForBranchRow(props.bazi, k)
  if (fromBazi) return fromBazi
  return ''
}

const onSelectBranch = (k) => {
  openKey.value = openKey.value === k ? '' : k
}

const onCloseSummon = () => {
  openKey.value = ''
}
</script>

<style scoped>
.hsr {
  margin-top: 8px;
  padding: 16px 10px 22px;
  border-radius: 16px;
  border: 1px solid rgba(200, 155, 60, 0.28);
  background: linear-gradient(195deg, rgba(11, 28, 44, 0.92), rgba(5, 5, 5, 0.82));
  opacity: 0;
  transform: translate3d(0, 16px, 0);
  transition:
    opacity 0.65s ease,
    transform 0.65s ease;
  transition-delay: calc(var(--sg) * 55ms);
  overflow: hidden;
}

.hsr--ready {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.hsr-head {
  text-align: center;
  margin-bottom: 14px;
}

.hsr-title {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
  color: #e8d5a8;
}

.hsr-sub {
  margin: 6px 0 0;
  font-size: 10px;
  color: #6b7280;
  letter-spacing: 0.16em;
}

.hsr-stage {
  position: relative;
  min-height: min(320px, 58vw);
  max-width: 440px;
  margin: 0 auto;
  transition: filter 0.45s ease;
}

.hsr-stage--summon {
  filter: brightness(0.72);
}

.hsr-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 12px;
}

.hsr-stars {
  background-image:
    radial-gradient(1px 1px at 15% 25%, rgba(255, 255, 255, 0.12), transparent),
    radial-gradient(1px 1px at 85% 15%, rgba(255, 255, 255, 0.08), transparent),
    radial-gradient(1px 1px at 40% 80%, rgba(77, 163, 255, 0.1), transparent);
  opacity: 0.35;
}

.hsr-mist {
  background: radial-gradient(ellipse 100% 80% at 50% 100%, rgba(11, 28, 44, 0.35), transparent 55%);
  opacity: 0.7;
}

.hsr-particles {
  background-image: radial-gradient(rgba(200, 155, 60, 0.06) 1px, transparent 1px);
  background-size: 18px 22px;
  animation: hsr-tide 8s linear infinite;
  opacity: 0.15;
}

.hsr-formation {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto auto auto;
  gap: 10px 12px;
  align-items: center;
  justify-items: center;
  padding: 12px 8px 8px;
  min-height: min(300px, 56vw);
}

.hsr-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(78%, 280px);
  aspect-ratio: 1;
  margin: calc(min(78%, 280px) / -2) 0 0 calc(min(78%, 280px) / -2);
  border-radius: 50%;
  border: 1px solid rgba(200, 155, 60, 0.12);
  animation: hsr-ring-rotate 24s linear infinite;
  pointer-events: none;
  opacity: 0.45;
}

.hsr-ring--slow {
  width: min(62%, 220px);
  margin: calc(min(62%, 220px) / -2) 0 0 calc(min(62%, 220px) / -2);
  animation-direction: reverse;
  animation-duration: 40s;
  border-color: rgba(77, 163, 255, 0.1);
  opacity: 0.35;
}

.hsr-pos-year {
  grid-column: 2;
  grid-row: 1;
}

.hsr-pos-month {
  grid-column: 1;
  grid-row: 2;
}

.hsr-pos-hour {
  grid-column: 3;
  grid-row: 2;
}

.hsr-taiji {
  grid-column: 2;
  grid-row: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(30px, 9vw, 42px);
  color: rgba(200, 155, 60, 0.4);
  text-shadow: 0 0 24px rgba(200, 155, 60, 0.25);
  animation: hsr-taiji 7s ease-in-out infinite;
  pointer-events: none;
}

.hsr-pos-day {
  grid-column: 2;
  grid-row: 4;
}

.hsr-pos-extra {
  grid-column: 1 / -1;
  justify-self: center;
}

.hsr--mobile {
  padding: 14px 8px 18px;
}

.hsr--mobile .hsr-formation {
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  gap: 14px;
  min-height: auto;
  padding-bottom: 16px;
}

.hsr--mobile .hsr-ring,
.hsr--mobile .hsr-ring--slow {
  display: none;
}

.hsr--mobile .hsr-pos-year {
  grid-column: 1;
  grid-row: 1;
}

.hsr--mobile .hsr-taiji {
  grid-column: 1;
  grid-row: 2;
  padding: 4px 0;
  animation: none;
}

.hsr--mobile .hsr-pos-month {
  grid-column: 1;
  grid-row: 3;
}

.hsr--mobile .hsr-pos-day {
  grid-column: 1;
  grid-row: 4;
}

.hsr--mobile .hsr-pos-hour {
  grid-column: 1;
  grid-row: 5;
}

.hsr--mobile .hsr-pos-extra {
  grid-column: 1;
  grid-row: 6;
}

.hsr--mobile .hsr-particles {
  animation: none;
  opacity: 0.08;
}

@media (prefers-reduced-motion: reduce) {
  .hsr-ring,
  .hsr-taiji,
  .hsr-particles {
    animation: none !important;
  }
}

@keyframes hsr-ring-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes hsr-taiji {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.55;
  }
  50% {
    transform: translateY(-4px);
    opacity: 0.95;
  }
}

@keyframes hsr-tide {
  to {
    transform: translateY(-12px);
  }
}
</style>
