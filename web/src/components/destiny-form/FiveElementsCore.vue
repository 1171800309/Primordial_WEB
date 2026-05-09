<template>
  <section class="fec" :class="{ 'fec--ready': ready, 'fec--mobile': isMobile }" :style="{ '--sg': stagger }">
    <div class="fec-aura" aria-hidden="true" />
    <header class="fec-head">
      <span class="fec-rune" aria-hidden="true" />
      <h3 class="fec-title">五行命炁图</h3>
      <p class="fec-sub">环形命盘 · 太极归中</p>
    </header>
    <div class="fec-ring-wrap">
      <FiveElementsRing :bazi="bazi" :xi-yong="xiYong" :ji-shen="jiShen" :is-mobile="isMobile" />
    </div>
  </section>
</template>

<script setup>
import FiveElementsRing from '@/components/destiny/FiveElementsRing.vue'

defineProps({
  bazi: { type: Object, default: null },
  xiYong: { type: String, default: '' },
  jiShen: { type: String, default: '' },
  ready: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  stagger: { type: Number, default: 0 }
})
</script>

<style scoped>
.fec {
  position: relative;
  margin: 8px 0 24px;
  padding: 18px 14px 22px;
  border-radius: 16px;
  border: 1px solid rgba(200, 155, 60, 0.3);
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(11, 28, 44, 0.9), rgba(5, 5, 5, 0.88));
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04) inset, 0 18px 48px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translate3d(0, 20px, 0) scale(0.98);
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
  transition-delay: calc(var(--sg) * 55ms);
}

.fec--ready {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

.fec-aura {
  position: absolute;
  inset: -2px;
  border-radius: 16px;
  background: linear-gradient(120deg, rgba(200, 155, 60, 0.08), transparent 40%, rgba(77, 163, 255, 0.06));
  pointer-events: none;
  animation: fec-breathe 5s ease-in-out infinite;
  opacity: 0.6;
}

.fec-head {
  text-align: center;
  margin-bottom: 8px;
}

.fec-rune {
  display: block;
  width: 36px;
  height: 1px;
  margin: 0 auto 10px;
  background: linear-gradient(90deg, transparent, rgba(200, 155, 60, 0.55), transparent);
}

.fec-title {
  margin: 0;
  font-size: clamp(13px, 3vw, 15px);
  letter-spacing: 0.35em;
  text-indent: 0.35em;
  color: #e8d5a8;
  text-shadow: 0 0 16px rgba(200, 155, 60, 0.25);
}

.fec-sub {
  margin: 8px 0 0;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: #6b7280;
}

.fec-ring-wrap {
  display: flex;
  justify-content: center;
  padding: 6px 0;
}

.fec--mobile .fec-aura {
  animation: none;
  opacity: 0.35;
}

@keyframes fec-breathe {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 0.85;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fec {
    transition: opacity 0.35s ease;
    transform: none !important;
  }

  .fec-aura {
    animation: none !important;
  }
}
</style>
