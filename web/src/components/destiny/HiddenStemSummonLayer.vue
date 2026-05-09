<template>
  <Teleport to="body">
    <div class="hss-root" :class="{ 'hss--open': visible, 'hss--mobile': isMobile }" @keydown.esc.prevent="close">
      <div class="hss-dim" aria-hidden="true" @click="close" />
      <div class="hss-panel" role="dialog" :aria-label="`藏干显化 · ${branchLabel}`">
        <button type="button" class="hss-close" @click="close">封回</button>

        <div class="hss-phase" :class="{ 'hss-phase--burst': burstIndex !== null }">
          <div class="hss-bgfx" aria-hidden="true" />
          <div class="hss-core-ring" aria-hidden="true" />
          <div class="hss-core-split" aria-hidden="true" />

          <p class="hss-branch-title">{{ branchLabel }}</p>
          <p class="hss-branch-char">{{ branchChar }}</p>

          <div v-if="stems.length" class="hss-orbit">
            <div
              v-for="(row, i) in stems"
              :key="i"
              class="hss-orbit-node"
              :class="{ 'hss-orbit-node--burst': burstIndex === i }"
              :style="{ '--a': `${(-90 + (360 / stems.length) * i).toFixed(2)}deg`, '--i': i }"
            >
              <button
                type="button"
                class="hss-stem-btn"
                :class="formationAura(row.god)"
                @click.stop="toggleBurst(i)"
              >
                <span class="hss-stem">{{ row.stem }}</span>
                <span class="hss-god-ring" :class="formationAura(row.god)">{{ row.god || '神' }}</span>
              </button>
            </div>
          </div>
          <p v-else class="hss-empty">此支气机未显化（接口无藏干数组）</p>

          <div v-if="burstIndex !== null && stems[burstIndex]" class="hss-detail">
            <span class="hss-detail-tag">十神显化</span>
            <p class="hss-detail-main">{{ stems[burstIndex].god || '—' }}</p>
            <p class="hss-detail-sub">藏干 {{ stems[burstIndex].stem }} · 气机解封</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { getTenGodFormationAura } from '@/utils/destinyModel'

const props = defineProps({
  visible: { type: Boolean, default: false },
  branchLabel: { type: String, default: '' },
  branchChar: { type: String, default: '' },
  stems: { type: Array, default: () => [] },
  isMobile: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const burstIndex = ref(null)

const formationAura = (god) => getTenGodFormationAura(god)

const close = () => {
  burstIndex.value = null
  emit('close')
}

const toggleBurst = (i) => {
  burstIndex.value = burstIndex.value === i ? null : i
}

watch(
  () => props.visible,
  (v) => {
    if (!v) burstIndex.value = null
    if (typeof document === 'undefined') return
    document.body.style.overflow = v ? 'hidden' : ''
  },
  { immediate: true }
)

onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<style scoped>
.hss-root {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.hss-root.hss--open {
  pointer-events: auto;
  opacity: 1;
}

.hss-dim {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, rgba(5, 5, 5, 0.55), rgba(5, 5, 5, 0.88));
  backdrop-filter: blur(4px);
}

.hss-panel {
  position: relative;
  width: min(420px, 100%);
  max-height: min(86vh, 640px);
  overflow: auto;
  border-radius: 16px;
  border: 1px solid rgba(200, 155, 60, 0.35);
  background: linear-gradient(165deg, rgba(11, 28, 44, 0.97), rgba(5, 5, 5, 0.96));
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 24px 80px rgba(0, 0, 0, 0.65);
}

.hss-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(200, 155, 60, 0.35);
  background: rgba(5, 5, 5, 0.5);
  color: #c9b896;
  font-size: 12px;
  letter-spacing: 0.2em;
  cursor: pointer;
  touch-action: manipulation;
}

.hss-phase {
  position: relative;
  padding: 36px 18px 28px;
  text-align: center;
}

.hss-bgfx {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.1), transparent),
    radial-gradient(1px 1px at 80% 20%, rgba(255, 255, 255, 0.08), transparent),
    radial-gradient(1px 1px at 40% 70%, rgba(77, 163, 255, 0.12), transparent);
  opacity: 0.4;
  pointer-events: none;
}

.hss-core-ring {
  position: absolute;
  left: 50%;
  top: 42%;
  width: min(72%, 260px);
  aspect-ratio: 1;
  margin-left: calc(min(72%, 260px) / -2);
  margin-top: calc(min(72%, 260px) / -2);
  border-radius: 50%;
  border: 1px solid rgba(200, 155, 60, 0.2);
  animation: hss-ring-spin 18s linear infinite;
  pointer-events: none;
  opacity: 0.55;
}

.hss-core-split {
  position: absolute;
  left: 50%;
  top: 42%;
  width: min(48%, 180px);
  height: 2px;
  margin-left: calc(min(48%, 180px) / -2);
  margin-top: -1px;
  background: linear-gradient(90deg, transparent, rgba(200, 155, 60, 0.45), transparent);
  transform-origin: center;
  animation: hss-split 1.4s ease-out forwards;
  opacity: 0;
  pointer-events: none;
}

.hss-phase--burst .hss-core-split {
  animation: hss-split-burst 0.6s ease-out forwards;
}

.hss-branch-title {
  position: relative;
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.35em;
  color: #9a9a8e;
}

.hss-branch-char {
  position: relative;
  margin: 8px 0 0;
  font-size: clamp(28px, 8vw, 40px);
  font-weight: 700;
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  color: #f0e6d4;
  text-shadow: 0 0 20px rgba(200, 155, 60, 0.35);
}

.hss-orbit {
  position: relative;
  width: min(280px, 88vw);
  aspect-ratio: 1;
  margin: 18px auto 0;
}

.hss-orbit-node {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform: rotate(var(--a)) translateY(calc(-42% - 0px)) rotate(calc(-1 * var(--a)));
  animation: hss-node-in 0.55s ease backwards;
  animation-delay: calc(var(--i) * 0.1s);
}

.hss-stem-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: none;
  border-radius: 12px;
  background: rgba(5, 5, 5, 0.55);
  border: 1px solid rgba(200, 155, 60, 0.28);
  color: #e8e4dc;
  cursor: pointer;
  transform: translate(-50%, -50%);
  touch-action: manipulation;
  transition:
    box-shadow 0.3s ease,
    transform 0.25s ease;
}

.hss-orbit-node--burst .hss-stem-btn {
  transform: translate(-50%, -50%) scale(1.08);
  box-shadow: 0 0 28px rgba(77, 163, 255, 0.25);
}

.hss-stem {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.2em;
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  background: linear-gradient(180deg, #fff6e0, #c89b3c);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hss-god-ring {
  font-size: 10px;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.hss-stem-btn:not(.formation-rob) .hss-god-ring {
  animation: hss-god-orbit 10s linear infinite;
}

/* 十神法阵 aura */
.hss-stem-btn.formation-7kill {
  border-color: rgba(255, 80, 60, 0.45);
  box-shadow: 0 0 16px rgba(255, 60, 40, 0.12);
}
.hss-stem-btn.formation-official {
  border-color: rgba(77, 163, 255, 0.4);
}
.hss-stem-btn.formation-seal-direct {
  border-color: rgba(200, 155, 60, 0.5);
  box-shadow: 0 0 14px rgba(200, 155, 60, 0.12);
}
.hss-stem-btn.formation-seal-side {
  border-color: rgba(124, 92, 255, 0.45);
  box-shadow: 0 0 14px rgba(124, 92, 255, 0.12);
}
.hss-stem-btn.formation-rob {
  border-color: rgba(200, 155, 60, 0.3);
}

.hss-stem-btn.formation-rob .hss-god-ring {
  animation: hss-rob-shake 2.5s ease-in-out infinite;
}
.hss-stem-btn.formation-hurt {
  border-color: rgba(180, 210, 255, 0.45);
  box-shadow: 0 0 12px rgba(120, 170, 255, 0.15);
}
.hss-stem-btn.formation-eat {
  border-color: rgba(200, 180, 120, 0.4);
}
.hss-stem-btn.formation-wealth {
  border-color: rgba(200, 155, 60, 0.38);
}

.hss-empty {
  margin: 20px 0 0;
  font-size: 12px;
  color: #6b7280;
  letter-spacing: 0.08em;
}

.hss-detail {
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(5, 5, 5, 0.55);
  border: 1px solid rgba(200, 155, 60, 0.2);
  animation: hss-detail-in 0.4s ease;
}

.hss-detail-tag {
  display: inline-block;
  font-size: 10px;
  letter-spacing: 0.25em;
  color: #9a9a8e;
  margin-bottom: 6px;
}

.hss-detail-main {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #e8d5a8;
  letter-spacing: 0.2em;
}

.hss-detail-sub {
  margin: 8px 0 0;
  font-size: 11px;
  color: #9a9a8e;
  letter-spacing: 0.08em;
}

.hss--mobile .hss-panel {
  width: 100%;
  max-height: 90vh;
}

.hss--mobile .hss-core-ring {
  opacity: 0.35;
  animation-duration: 28s;
}

.hss--mobile .hss-dim {
  backdrop-filter: blur(2px);
}

@media (hover: hover) and (pointer: fine) {
  .hss-stem-btn:hover {
    border-color: rgba(200, 155, 60, 0.55);
    box-shadow: 0 0 20px rgba(200, 155, 60, 0.15);
  }
}

@keyframes hss-ring-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes hss-split {
  from {
    opacity: 0;
    transform: scaleX(0.2);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes hss-split-burst {
  0% {
    opacity: 0.8;
    transform: scaleX(1) scaleY(1);
  }
  50% {
    opacity: 1;
    transform: scaleX(1.15) scaleY(6);
  }
  100% {
    opacity: 0.4;
    transform: scaleX(1) scaleY(1);
  }
}

@keyframes hss-node-in {
  from {
    opacity: 0;
    filter: blur(4px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes hss-god-orbit {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes hss-rob-shake {
  0%,
  100% {
    transform: rotate(0deg) translateX(0);
  }
  50% {
    transform: rotate(0deg) translateX(1px);
  }
}

@keyframes hss-detail-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hss-core-ring,
  .hss-stem-btn:not(.formation-rob) .hss-god-ring,
  .hss-stem-btn.formation-rob .hss-god-ring {
    animation: none !important;
  }

  .hss-orbit-node {
    animation: none !important;
  }
}
</style>
