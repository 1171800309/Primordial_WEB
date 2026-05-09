<template>
  <div
    class="mingpan-root"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div v-if="loading" class="state ritual-boot">
      <div class="boot-halo" />
      <p class="boot-title">正在推演命盘</p>
      <p class="boot-sub">天机推演中…</p>
    </div>

    <div v-else-if="error" class="state state-error">{{ error }}</div>

    <div v-else-if="isTrulyEmpty" class="state state-empty">{{ emptyHint }}</div>

    <div v-else class="ritual-body" :style="parallaxStyle">
      <Transition name="fade">
        <div v-if="!introDone" class="phase-intro" key="intro">
          <div class="intro-orbit" aria-hidden="true" />
          <div class="intro-glow" />
          <p class="intro-title">正在推演命盘…</p>
          <p class="intro-particles" aria-hidden="true" />
        </div>
      </Transition>

      <div v-show="introDone" class="reveal-stack">
        <p v-if="hintOnly" class="hint-banner">{{ hintOnly }}</p>

        <div v-if="birthDir" class="birth-dir">
          <span class="dir-label">出生方位</span>
          <span class="dir-val">{{ birthDir }}</span>
        </div>

        <div v-if="hourLine" class="hour-ribbon">
          <span v-if="hourSummary.hourGanZhi" class="ribbon-pill">时柱 {{ hourSummary.hourGanZhi }}</span>
          <span v-if="hourSummary.actualBirthTime" class="ribbon-text">真太阳时 {{ hourSummary.actualBirthTime }}</span>
          <span v-if="hourSummary.longitudeCorrectionMinutes !== '' && hourSummary.longitudeCorrectionMinutes != null" class="ribbon-text">
            经度校正 {{ hourSummary.longitudeCorrectionMinutes }} 分
          </span>
        </div>

        <FourPillars :bazi="bzObj" />
        <FiveElementsRing :bazi="bzObj" :xi-yong="xiYong" :ji-shen="jiShen" :is-mobile="isMobile" />
        <TwelveGrowthStage :stage="twelveStage" :is-mobile="isMobile" />
        <GodEnergyPanel :data="stemGods" />
        <HiddenBranchesPanel :data="hiddenGods" :bazi="bzObj" />
        <DestinyBalance
          :composite="composite"
          :body-snippet="bodySnippet"
          :axis-entries="axisEntries"
          :xi-yong="xiYong"
          :ji-shen="jiShen"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import FourPillars from './FourPillars.vue'
import FiveElementsRing from './FiveElementsRing.vue'
import TwelveGrowthStage from './TwelveGrowthStage.vue'
import DestinyBalance from './DestinyBalance.vue'
import GodEnergyPanel from './GodEnergyPanel.vue'
import HiddenBranchesPanel from './HiddenBranchesPanel.vue'
import {
  parseBirthDirection,
  parseTwelveStage,
  parseCompositeJudgment,
  parseBodyStrengthSnippet,
  parseXiYongWuXing,
  parseJiShenWuXing,
  parseBalanceAxes,
  parseStemTenGods,
  parseHiddenBranchGods
} from '@/utils/destinyModel'

const props = defineProps({
  bazi: { type: [Object, String, null], default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  emptyHint: { type: String, default: '' },
  hourSummary: { type: Object, default: () => ({}) }
})

const introDone = ref(false)
let introTimer = null

const isMobile = ref(false)
let mq
const applyMq = () => {
  if (mq) isMobile.value = mq.matches
}

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

const clearIntroTimer = () => {
  if (introTimer) {
    clearTimeout(introTimer)
    introTimer = null
  }
}

const scheduleIntro = () => {
  clearIntroTimer()
  if (reducedMotion) {
    introDone.value = true
    return
  }
  introDone.value = false
  introTimer = setTimeout(() => {
    introDone.value = true
    introTimer = null
  }, 3000)
}

const isTrulyEmpty = computed(() => {
  const v = props.bazi
  return v == null || (typeof v === 'string' && !String(v).trim())
})

const hintOnly = computed(() => {
  const v = props.bazi
  if (typeof v === 'string') return v.trim()
  if (!v || typeof v !== 'object') return ''
  const h = v['提示']
  return typeof h === 'string' && h.trim() ? h.trim() : ''
})

const bzObj = computed(() => (typeof props.bazi === 'object' && props.bazi ? props.bazi : null))

const birthDir = computed(() => parseBirthDirection(bzObj.value))
const twelveStage = computed(() => parseTwelveStage(bzObj.value))
const composite = computed(() => parseCompositeJudgment(bzObj.value))
const bodySnippet = computed(() => parseBodyStrengthSnippet(bzObj.value))
const xiYong = computed(() => parseXiYongWuXing(bzObj.value))
const jiShen = computed(() => parseJiShenWuXing(bzObj.value))
const stemGods = computed(() => parseStemTenGods(bzObj.value))
const hiddenGods = computed(() => parseHiddenBranchGods(bzObj.value))

const axisEntries = computed(() => {
  const axes = parseBalanceAxes(bzObj.value)
  return Object.entries(axes).filter(([, v]) => v != null && v !== '')
})

const hourLine = computed(() => {
  const h = props.hourSummary || {}
  return !!(h.hourGanZhi || h.actualBirthTime || h.longitudeCorrectionMinutes)
})

watch(
  () => [props.bazi, props.loading, props.error],
  () => {
    if (props.loading || props.error || isTrulyEmpty.value) {
      clearIntroTimer()
      introDone.value = !props.loading && !isTrulyEmpty.value && !props.error
      return
    }
    scheduleIntro()
  },
  { immediate: true }
)

onMounted(() => {
  mq = window.matchMedia('(max-width: 767px)')
  applyMq()
  mq.addEventListener('change', applyMq)
})

onUnmounted(() => {
  clearIntroTimer()
  mq?.removeEventListener('change', applyMq)
})

/* 移动端：轻触视差（非核心交互，仅位移 1～2px） */
const tilt = ref({ x: 0, y: 0 })
const onTouchStart = () => {}
const onTouchMove = (e) => {
  if (!isMobile.value || reducedMotion) return
  const t = e.touches?.[0]
  if (!t) return
  const nx = ((t.clientX / window.innerWidth) - 0.5) * 3
  const ny = ((t.clientY / window.innerHeight) - 0.5) * 3
  tilt.value = { x: nx, y: ny }
}
const onTouchEnd = () => {
  tilt.value = { x: 0, y: 0 }
}

const parallaxStyle = computed(() => ({
  transform: `translate3d(${tilt.value.x}px, ${tilt.value.y}px, 0)`
}))
</script>

<style scoped>
.mingpan-root {
  position: relative;
  min-height: 280px;
  overflow-x: hidden;
  touch-action: pan-y;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  text-align: center;
  padding: 24px;
}

.ritual-boot {
  position: relative;
  overflow: hidden;
}

.boot-halo {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200, 155, 60, 0.2), transparent 70%);
  animation: halo-breathe 3s ease-in-out infinite;
}

@keyframes halo-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

.boot-title {
  position: relative;
  margin: 0;
  font-size: clamp(18px, 4vw, 22px);
  letter-spacing: 0.45em;
  text-indent: 0.45em;
  color: #e8d5a8;
  text-shadow: 0 0 24px rgba(200, 155, 60, 0.45);
  animation: text-breathe 2.4s ease-in-out infinite;
}

.boot-sub {
  position: relative;
  margin: 12px 0 0;
  font-size: 12px;
  letter-spacing: 0.25em;
  color: #9a9a8e;
}

@keyframes text-breathe {
  0%,
  100% {
    opacity: 0.85;
  }
  50% {
    opacity: 1;
  }
}

.state-error {
  color: #ff9a8e;
  font-size: 14px;
}

.state-empty {
  color: #9a9a8e;
  font-size: 14px;
  letter-spacing: 0.08em;
}

.ritual-body {
  position: relative;
  will-change: transform;
}

.phase-intro {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: radial-gradient(ellipse 70% 60% at 50% 45%, rgba(5, 5, 5, 0.2), rgba(5, 5, 5, 0.75));
}

.intro-orbit {
  position: absolute;
  width: min(90vw, 420px);
  height: min(90vw, 420px);
  border-radius: 50%;
  border: 1px solid rgba(200, 155, 60, 0.12);
  animation: orbit-spin 24s linear infinite;
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

.intro-glow {
  position: absolute;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200, 155, 60, 0.18), transparent 65%);
  animation: halo-breathe 2.8s ease-in-out infinite;
}

.intro-title {
  position: relative;
  margin: 0;
  font-size: clamp(16px, 3.8vw, 20px);
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  color: #f0e6d4;
  text-shadow: 0 0 28px rgba(200, 155, 60, 0.5);
  animation: text-breathe 2.2s ease-in-out infinite;
}

.intro-particles {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(77, 163, 255, 0.12) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.35;
  animation: drift 20s linear infinite;
}

@keyframes drift {
  to {
    transform: translate3d(-24px, -12px, 0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.9s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.reveal-stack {
  position: relative;
  z-index: 1;
  padding-top: 8px;
}

.hint-banner {
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: clamp(12px, 3vw, 13px);
  line-height: 1.65;
  color: #c9c4b8;
  background: rgba(5, 5, 5, 0.45);
  border: 1px solid rgba(200, 155, 60, 0.12);
  letter-spacing: 0.04em;
}

.birth-dir {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(200, 155, 60, 0.12);
  background: rgba(5, 5, 5, 0.35);
  font-size: clamp(12px, 3vw, 13px);
}

.dir-label {
  color: #9a9a8e;
  letter-spacing: 0.2em;
}

.dir-val {
  color: #e8e4dc;
  letter-spacing: 0.06em;
}

.hour-ribbon {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-bottom: 22px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(5, 5, 5, 0.4);
  border: 1px solid rgba(77, 163, 255, 0.15);
  font-size: clamp(12px, 3vw, 13px);
  color: #d4cfc4;
}

.ribbon-pill {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(200, 155, 60, 0.35);
  color: #e8d5a8;
  letter-spacing: 0.06em;
}

@media (prefers-reduced-motion: reduce) {
  .boot-halo,
  .boot-title,
  .intro-orbit,
  .intro-glow,
  .intro-title,
  .intro-particles {
    animation: none !important;
  }
}
</style>
