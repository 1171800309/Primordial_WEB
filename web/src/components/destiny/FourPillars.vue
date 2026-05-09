<template>
  <section class="block pillars-block">
    <h3 class="block-title"><span class="title-glow">四柱显现</span></h3>
    <div class="pillar-row">
      <article
        v-for="(cell, idx) in entries"
        :key="cell.key"
        class="pillar-scroll"
        :class="`pillar-order-${idx}`"
        :style="{ ...pillarCardStyle(cell), animationDelay: `${idx * 0.18}s` }"
      >
        <span class="pillar-spark" aria-hidden="true" />
        <span class="pillar-orbit" aria-hidden="true" />
        <span class="pillar-label">{{ cell.label }}</span>
        <div v-if="pair(cell).stem || pair(cell).branch" class="pillar-ganzi-wrap">
          <span
            v-if="pair(cell).stem"
            class="pillar-char pillar-stem"
            :class="wxClass('stem', cell)"
          >{{ pair(cell).stem }}</span>
          <span
            v-if="pair(cell).branch"
            class="pillar-char pillar-branch"
            :class="wxClass('branch', cell)"
          >{{ pair(cell).branch }}</span>
        </div>
        <span v-else class="pillar-ganzi-fallback">—</span>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { getPillarEntries, getPillarWuClassPair } from '@/utils/destinyModel'

const props = defineProps({
  bazi: { type: Object, default: null }
})

const entries = computed(() => getPillarEntries(props.bazi))

const rawPillar = (cell) => {
  const p = props.bazi?.['四柱干支']
  if (p && typeof p === 'object' && cell.key in p) return p[cell.key]
  return cell.text
}

const pair = (cell) => {
  const wx = getPillarWuClassPair(rawPillar(cell))
  return { stem: wx.stem, branch: wx.branch, stemWx: wx.stemWx, branchWx: wx.branchWx }
}

const wxClass = (part, cell) => {
  const w = part === 'stem' ? pair(cell).stemWx : pair(cell).branchWx
  return w ? `wx--${w}` : ''
}

const pillarCardStyle = (cell) => {
  const p = pair(cell)
  const stemC = colorVar(p.stemWx)
  const brC = colorVar(p.branchWx)
  if (!stemC && !brC) return {}
  return {
    '--pillar-stem-glow': stemC || 'transparent',
    '--pillar-branch-glow': brC || 'transparent'
  }
}

const colorVar = (wx) => {
  const map = {
    金: 'rgba(200, 155, 60, 0.45)',
    木: 'rgba(79, 175, 108, 0.42)',
    水: 'rgba(77, 163, 255, 0.42)',
    火: 'rgba(255, 107, 74, 0.42)',
    土: 'rgba(154, 123, 92, 0.4)'
  }
  return map[wx] || ''
}
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

.pillar-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(8px, 2vw, 12px);
}

@media (max-width: 767px) {
  .pillar-row {
    grid-template-columns: 1fr;
  }
}

.pillar-scroll {
  position: relative;
  padding: clamp(14px, 3vw, 18px) 10px clamp(16px, 3vw, 20px);
  text-align: center;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(11, 28, 44, 0.85), rgba(5, 5, 5, 0.65));
  border: 1px solid rgba(200, 155, 60, 0.28);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
    0 12px 28px rgba(0, 0, 0, 0.35);
  animation: pillar-rise 0.95s ease-out both;
  overflow: hidden;
}

.pillar-orbit {
  position: absolute;
  inset: -40%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    var(--pillar-stem-glow, transparent) 90deg,
    transparent 180deg,
    var(--pillar-branch-glow, transparent) 270deg,
    transparent 360deg
  );
  opacity: 0.35;
  animation: pillar-orbit-spin 14s linear infinite;
  pointer-events: none;
}

@keyframes pillar-orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

.pillar-spark {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(200, 155, 60, 0.12), transparent 55%);
  pointer-events: none;
  animation: sweep-gold 3.2s ease-in-out infinite;
}

@keyframes sweep-gold {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.85;
  }
}

@keyframes pillar-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 22px, 0) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.pillar-scroll::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--pillar-stem-glow, rgba(200, 155, 60, 0.45)), transparent);
  opacity: 0.75;
}

.pillar-label {
  position: relative;
  display: block;
  font-size: clamp(10px, 2.5vw, 11px);
  letter-spacing: 0.2em;
  color: #9a9a8e;
  margin-bottom: 8px;
}

.pillar-ganzi-wrap {
  position: relative;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.12em;
}

.pillar-char {
  font-size: clamp(17px, 4.5vw, 24px);
  font-weight: 600;
  letter-spacing: 0.12em;
  transition: text-shadow 0.35s ease, filter 0.35s ease;
}

.pillar-stem {
  text-shadow: 0 0 14px rgba(255, 255, 255, 0.12);
}

.pillar-branch {
  text-shadow: 0 0 14px rgba(255, 255, 255, 0.12);
}

.pillar-ganzi-fallback {
  position: relative;
  font-size: clamp(17px, 4.5vw, 22px);
  color: #6b7280;
}

.wx--金 {
  color: #e8d5a8;
}
.wx--木 {
  color: #7fd99a;
}
.wx--水 {
  color: #7eb8ff;
}
.wx--火 {
  color: #ff9a82;
}
.wx--土 {
  color: #c4a882;
}

@media (max-width: 767px) {
  .pillar-scroll {
    animation-duration: 0.65s;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.03) inset, 0 8px 18px rgba(0, 0, 0, 0.32);
  }

  .pillar-orbit {
    opacity: 0.22;
    animation-duration: 22s;
  }

  .pillar-spark {
    animation: none;
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pillar-scroll,
  .pillar-spark,
  .pillar-orbit {
    animation: none !important;
  }
}
</style>
