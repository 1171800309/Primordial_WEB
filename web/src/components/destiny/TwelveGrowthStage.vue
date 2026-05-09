<template>
  <section class="block twelve-block">
    <h3 class="block-title"><span class="title-glow">十二长生命轮</span></h3>
    <div
      class="twelve-wheel"
      :class="[wheelEffectClass, { 'twelve-wheel--mobile': isMobile }]"
    >
      <div
        v-for="(name, i) in twelveNames"
        :key="name"
        class="twelve-node"
        :class="{ active: name === currentStage }"
        :style="nodeStyle(i)"
      >
        {{ name }}
      </div>
      <div class="twelve-hub">{{ currentStage || '炁' }}</div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { TWELVE_STAGES, getTwelveStageEffectClass } from '@/utils/destinyModel'

const props = defineProps({
  stage: { type: String, default: '' },
  isMobile: { type: Boolean, default: false }
})

const twelveNames = TWELVE_STAGES
const currentStage = computed(() => String(props.stage || '').trim())

const wheelEffectClass = computed(() => getTwelveStageEffectClass(currentStage.value))

const radius = computed(() => (props.isMobile ? 88 : 108))

const nodeStyle = (i) => {
  const r = radius.value
  return {
    transform: `rotate(${i * 30}deg) translateY(-${r}px) rotate(${-i * 30}deg)`
  }
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

.twelve-wheel {
  position: relative;
  width: min(100%, 280px);
  height: 260px;
  margin: 0 auto;
  transform-origin: 50% 50%;
}

.twelve-wheel--mobile {
  width: min(100%, 260px);
  height: 240px;
}

.twelve-node {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 36px;
  margin-left: -18px;
  margin-top: -12px;
  text-align: center;
  font-size: clamp(10px, 2.6vw, 11px);
  color: #6b7280;
  transform-origin: center center;
  transition: color 0.45s ease, text-shadow 0.45s ease;
}

.twelve-node.active {
  color: #e8d5a8;
  font-weight: 600;
  text-shadow: 0 0 14px rgba(200, 155, 60, 0.5);
}

.twelve-hub {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 56px;
  height: 56px;
  margin: -28px 0 0 -28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(12px, 3vw, 13px);
  font-weight: 600;
  color: #c89b3c;
  border: 1px solid rgba(200, 155, 60, 0.35);
  background: rgba(5, 5, 5, 0.6);
  box-shadow: 0 0 20px rgba(200, 155, 60, 0.12);
  transition: box-shadow 0.5s ease, color 0.5s ease;
}

/* 特效映射：帝旺 */
.effect-emperor .twelve-hub {
  box-shadow: 0 0 32px rgba(200, 155, 60, 0.45);
  animation: hub-pulse 1.8s ease-in-out infinite;
}

.effect-emperor .twelve-node.active {
  animation: node-pulse 1.5s ease-in-out infinite;
}

@keyframes hub-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

@keyframes node-pulse {
  0%,
  100% {
    text-shadow: 0 0 14px rgba(200, 155, 60, 0.5);
  }
  50% {
    text-shadow: 0 0 22px rgba(200, 155, 60, 0.85);
  }
}

/* 墓：收缩、低频 */
.effect-tomb .twelve-hub {
  box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.45), 0 0 12px rgba(139, 107, 46, 0.15);
  animation: tomb-breathe 4s ease-in-out infinite;
}

@keyframes tomb-breathe {
  0%,
  100% {
    opacity: 0.85;
  }
  50% {
    opacity: 1;
  }
}

/* 绝：收敛 */
.effect-death .twelve-hub {
  color: #8a8a8a;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
}

.effect-death .twelve-node.active {
  color: #9a9a9e;
  text-shadow: none;
}

.effect-weak .twelve-hub {
  opacity: 0.88;
}

.effect-flow .twelve-hub {
  box-shadow: 0 0 18px rgba(77, 163, 255, 0.2);
}

.effect-seed .twelve-hub {
  box-shadow: 0 0 16px rgba(79, 175, 108, 0.18);
}

.effect-default .twelve-hub {
  box-shadow: 0 0 16px rgba(200, 155, 60, 0.1);
}

@media (prefers-reduced-motion: reduce) {
  .effect-emperor .twelve-hub,
  .effect-emperor .twelve-node.active,
  .effect-tomb .twelve-hub {
    animation: none !important;
  }
}
</style>
