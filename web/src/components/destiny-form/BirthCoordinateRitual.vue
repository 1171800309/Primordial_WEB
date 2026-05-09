<template>
  <section class="bcr" :class="{ 'bcr--ready': ready, 'bcr--mobile': isMobile }" :style="{ '--sg': stagger }">
    <header class="bcr-head">
      <h3 class="bcr-title">天机坐标</h3>
      <p class="bcr-sub">方位定位 · 星图一点</p>
    </header>
    <div class="bcr-map">
      <span class="bcr-grid" aria-hidden="true" />
      <span class="bcr-cross v" aria-hidden="true" />
      <span class="bcr-cross h" aria-hidden="true" />
      <span class="bcr-pulse" aria-hidden="true" />
      <p class="bcr-val">{{ display }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  ready: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  stagger: { type: Number, default: 0 }
})

const display = computed(() => String(props.text || '').trim() || '暂无天机')
</script>

<style scoped>
.bcr {
  padding: 14px 12px 18px;
  border-radius: 14px;
  border: 1px solid rgba(200, 155, 60, 0.22);
  background: radial-gradient(ellipse 100% 80% at 50% 120%, rgba(77, 163, 255, 0.08), rgba(5, 5, 5, 0.78));
  opacity: 0;
  transform: translate3d(0, 16px, 0);
  transition:
    opacity 0.65s ease,
    transform 0.65s ease;
  transition-delay: calc(var(--sg) * 55ms);
}

.bcr--ready {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.bcr-head {
  text-align: center;
  margin-bottom: 12px;
}

.bcr-title {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
  color: #e8d5a8;
}

.bcr-sub {
  margin: 6px 0 0;
  font-size: 10px;
  color: #6b7280;
  letter-spacing: 0.16em;
}

.bcr-map {
  position: relative;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bcr-grid {
  position: absolute;
  inset: 8px;
  border-radius: 10px;
  background-image:
    linear-gradient(rgba(200, 155, 60, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 155, 60, 0.06) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.5;
}

.bcr-cross {
  position: absolute;
  background: rgba(77, 163, 255, 0.2);
}

.bcr-cross.v {
  width: 1px;
  height: 70%;
  left: 50%;
  top: 15%;
  transform: translateX(-50%);
}

.bcr-cross.h {
  height: 1px;
  width: 70%;
  top: 50%;
  left: 15%;
  transform: translateY(-50%);
}

.bcr-pulse {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 48px;
  height: 48px;
  margin: -24px 0 0 -24px;
  border-radius: 50%;
  border: 1px solid rgba(200, 155, 60, 0.35);
  animation: coord-pulse 2.4s ease-in-out infinite;
  pointer-events: none;
}

.bcr-val {
  position: relative;
  margin: 0;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: #f0e6d4;
  text-shadow: 0 0 14px rgba(200, 155, 60, 0.25);
  background: rgba(5, 5, 5, 0.55);
  border: 1px solid rgba(200, 155, 60, 0.25);
  border-radius: 10px;
}

.bcr--mobile .bcr-pulse {
  animation: none;
  opacity: 0.55;
}

@keyframes coord-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.55;
  }
  50% {
    transform: scale(1.12);
    opacity: 0.9;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bcr {
    transition: opacity 0.3s ease;
    transform: none !important;
  }

  .bcr-pulse {
    animation: none !important;
  }
}
</style>
