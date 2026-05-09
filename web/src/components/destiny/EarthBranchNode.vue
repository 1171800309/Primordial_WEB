<template>
  <button
    type="button"
    class="ebs"
    :class="[
      `ebs--${position}`,
      { 'ebs--active': active, 'ebs--mobile': isMobile, [`ebs--wx-${wxAura}`]: wxAura }
    ]"
    :aria-pressed="active"
    @click="$emit('activate', branchKey)"
  >
    <span class="ebs-bagua" aria-hidden="true" />
    <span class="ebs-orbit" aria-hidden="true" />
    <span class="ebs-dust" aria-hidden="true" />
    <span class="ebs-label">{{ branchKey }}</span>
    <span class="ebs-seal">{{ displayChar }}</span>
    <span class="ebs-glint" aria-hidden="true" />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { getBranchRowAuraWuXing } from '@/utils/destinyModel'

const props = defineProps({
  branchKey: { type: String, required: true },
  /** 地支一字，如法阵封印核 */
  diZhi: { type: String, default: '' },
  position: { type: String, default: 'year' },
  active: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  bazi: { type: Object, default: null }
})

defineEmits(['activate'])

const displayChar = computed(() => {
  const c = String(props.diZhi || '').trim()
  return c || '·'
})

const wxAura = computed(() => getBranchRowAuraWuXing(props.bazi, props.branchKey))
</script>

<style scoped>
.ebs {
  --ebs-gold: #c89b3c;
  position: relative;
  width: min(100px, 26vw);
  height: min(100px, 26vw);
  border: none;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  color: #f0e6d4;
  font: inherit;
  background: radial-gradient(circle at 35% 28%, rgba(11, 28, 44, 0.95), rgba(5, 5, 5, 0.92));
  box-shadow:
    0 0 0 1px rgba(200, 155, 60, 0.35),
    0 0 0 2px rgba(0, 0, 0, 0.4) inset,
    0 12px 28px rgba(0, 0, 0, 0.55);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition:
    box-shadow 0.35s ease,
    transform 0.25s ease;
}

.ebs:active {
  transform: scale(0.96);
}

.ebs-bagua {
  position: absolute;
  inset: -8%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(200, 155, 60, 0.08),
    transparent 30deg,
    rgba(77, 163, 255, 0.06) 90deg,
    transparent 150deg,
    rgba(200, 155, 60, 0.07) 210deg,
    transparent 270deg,
    rgba(124, 92, 255, 0.05) 310deg,
    transparent 360deg
  );
  opacity: 0.55;
  animation: ebs-bagua-spin 22s linear infinite;
  pointer-events: none;
}

.ebs-orbit {
  position: absolute;
  inset: 4%;
  border-radius: 50%;
  border: 1px dashed rgba(200, 155, 60, 0.22);
  pointer-events: none;
  animation: ebs-orbit-pulse 3.2s ease-in-out infinite;
}

.ebs-dust {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-image: radial-gradient(rgba(232, 228, 220, 0.14) 1px, transparent 1px);
  background-size: 10px 12px;
  opacity: 0.2;
  animation: ebs-dust 5s linear infinite;
  pointer-events: none;
}

.ebs-label {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  letter-spacing: 0.24em;
  color: #9a9a8e;
  white-space: nowrap;
}

.ebs-seal {
  position: relative;
  display: block;
  margin-top: 14px;
  font-size: clamp(22px, 6.5vw, 30px);
  font-weight: 700;
  letter-spacing: 0.15em;
  font-family: 'KaiTi', 'STKaiti', 'SimSun', serif;
  background: linear-gradient(180deg, #fff6e0, var(--ebs-gold), #6b5224);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 10px rgba(200, 155, 60, 0.35));
  animation: ebs-breathe 3.6s ease-in-out infinite;
}

.ebs-glint {
  position: absolute;
  inset: 18%;
  border-radius: 50%;
  background: linear-gradient(120deg, transparent 40%, rgba(255, 255, 255, 0.08) 50%, transparent 60%);
  animation: ebs-glint-move 3s ease-in-out infinite;
  pointer-events: none;
}

.ebs--active {
  box-shadow:
    0 0 0 2px rgba(77, 163, 255, 0.55),
    0 0 0 1px rgba(200, 155, 60, 0.45) inset,
    0 0 36px rgba(77, 163, 255, 0.25),
    0 0 48px rgba(200, 155, 60, 0.15);
  transform: scale(1.04);
}

.ebs--active .ebs-bagua {
  opacity: 0.95;
  animation-duration: 12s;
}

.ebs--active .ebs-orbit {
  border-color: rgba(200, 155, 60, 0.55);
}

.ebs--wx-金 {
  box-shadow:
    0 0 0 1px rgba(200, 155, 60, 0.42),
    0 0 18px rgba(200, 155, 60, 0.12);
}
.ebs--wx-木 {
  box-shadow:
    0 0 0 1px rgba(79, 175, 108, 0.35),
    0 0 18px rgba(79, 175, 108, 0.1);
}
.ebs--wx-水 {
  box-shadow:
    0 0 0 1px rgba(77, 163, 255, 0.35),
    0 0 18px rgba(77, 163, 255, 0.1);
}
.ebs--wx-火 {
  box-shadow:
    0 0 0 1px rgba(255, 107, 74, 0.35),
    0 0 18px rgba(255, 107, 74, 0.1);
}
.ebs--wx-土 {
  box-shadow:
    0 0 0 1px rgba(154, 123, 92, 0.38),
    0 0 18px rgba(154, 123, 92, 0.1);
}

.ebs--mobile {
  width: min(92px, 30vw);
  height: min(92px, 30vw);
}

.ebs--mobile .ebs-bagua {
  animation-duration: 32s;
  opacity: 0.4;
}

.ebs--mobile .ebs-dust {
  opacity: 0.1;
  animation: none;
}

@media (hover: hover) and (pointer: fine) {
  .ebs:hover {
    box-shadow:
      0 0 0 1px rgba(200, 155, 60, 0.55),
      0 0 28px rgba(200, 155, 60, 0.18);
  }

  .ebs:hover .ebs-orbit {
    border-color: rgba(200, 155, 60, 0.45);
  }
}

@keyframes ebs-bagua-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ebs-orbit-pulse {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 0.9;
  }
}

@keyframes ebs-dust {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ebs-breathe {
  0%,
  100% {
    filter: drop-shadow(0 0 8px rgba(200, 155, 60, 0.28));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(200, 155, 60, 0.45));
  }
}

@keyframes ebs-glint-move {
  0%,
  100% {
    transform: rotate(-8deg);
    opacity: 0.3;
  }
  50% {
    transform: rotate(8deg);
    opacity: 0.65;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ebs-bagua,
  .ebs-orbit,
  .ebs-dust,
  .ebs-seal,
  .ebs-glint {
    animation: none !important;
  }
}
</style>
