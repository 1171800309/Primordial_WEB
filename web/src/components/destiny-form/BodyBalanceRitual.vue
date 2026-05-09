<template>
  <section class="bbr" :class="{ 'bbr--ready': ready, 'bbr--mobile': isMobile }" :style="{ '--sg': stagger }">
    <header class="bbr-head">
      <h3 class="bbr-title">命格强弱</h3>
      <p class="bbr-sub">阴阳天平 · 气机倾角</p>
    </header>
    <div class="bbr-scale">
      <div class="bbr-beam" :style="{ transform: `rotate(${tiltDeg}deg)` }">
        <span class="bbr-yin" />
        <span class="bbr-yang" />
        <span class="bbr-fulcrum" />
      </div>
      <p class="bbr-text">{{ textDisplay }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  composite: { type: String, default: '' },
  ready: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  stagger: { type: Number, default: 0 }
})

const merged = computed(() => `${props.text || ''} ${props.composite || ''}`)

const tiltDeg = computed(() => {
  const s = merged.value
  if (/偏强|身强|从强|旺/.test(s)) return -7
  if (/偏弱|身弱|从弱|衰|病/.test(s)) return 7
  return 0
})

const textDisplay = computed(() => {
  const t = String(props.text || '').trim()
  if (t) return t
  const c = String(props.composite || '').trim()
  return c || '暂无天机'
})
</script>

<style scoped>
.bbr {
  padding: 14px 12px 18px;
  border-radius: 14px;
  border: 1px solid rgba(200, 155, 60, 0.22);
  background: linear-gradient(180deg, rgba(11, 28, 44, 0.82), rgba(5, 5, 5, 0.72));
  opacity: 0;
  transform: translate3d(0, 16px, 0);
  transition:
    opacity 0.65s ease,
    transform 0.65s ease;
  transition-delay: calc(var(--sg) * 55ms);
}

.bbr--ready {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.bbr-head {
  text-align: center;
  margin-bottom: 12px;
}

.bbr-title {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
  color: #e8d5a8;
}

.bbr-sub {
  margin: 6px 0 0;
  font-size: 10px;
  color: #6b7280;
  letter-spacing: 0.16em;
}

.bbr-scale {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.bbr-beam {
  position: relative;
  width: 72%;
  max-width: 220px;
  height: 6px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(77, 163, 255, 0.35), rgba(200, 155, 60, 0.45));
  transform-origin: 50% 50%;
  transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 0 14px rgba(0, 0, 0, 0.35);
}

.bbr-yin,
.bbr-yang {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transform: translateY(-50%);
}

.bbr-yin {
  left: 4px;
  background: radial-gradient(circle at 30% 30%, #4da3ff, #0b1c2c);
  border: 1px solid rgba(77, 163, 255, 0.4);
}

.bbr-yang {
  right: 4px;
  background: radial-gradient(circle at 30% 30%, #e8d5a8, #3a2a0f);
  border: 1px solid rgba(200, 155, 60, 0.45);
}

.bbr-fulcrum {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: #050505;
  border: 1px solid rgba(200, 155, 60, 0.5);
  box-shadow: 0 0 10px rgba(200, 155, 60, 0.25);
}

.bbr-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: #d4cfc4;
  text-align: center;
  letter-spacing: 0.06em;
  max-width: 100%;
}

.bbr--mobile .bbr-beam {
  height: 5px;
}

@media (prefers-reduced-motion: reduce) {
  .bbr {
    transition: opacity 0.3s ease;
    transform: none !important;
  }

  .bbr-beam {
    transition: none;
  }
}
</style>
