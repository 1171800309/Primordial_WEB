<template>
  <section class="block balance-block">
    <h3 class="block-title"><span class="title-glow">命格平衡 · 喜忌</span></h3>
    <div class="balance-yinyang" :class="moodClass">
      <div class="yin arc" />
      <div class="yang arc" />
      <div class="balance-center">
        <p class="composite">{{ composite || '待推演' }}</p>
        <p v-if="bodySnippet" class="body-snippet">{{ bodySnippet }}</p>
      </div>
    </div>

    <div v-if="axisEntries.length" class="axes-grid">
      <div v-for="[key, val] in axisEntries" :key="key" class="axis-chip">
        <span class="axis-key">{{ key }}</span>
        <span class="axis-val">{{ formatAxisValue(val) }}</span>
      </div>
    </div>

    <div class="xiyong-row">
      <div v-if="xiYong" class="xiyong-pill favor">
        <span class="pill-label">喜用神五行</span>
        <span class="pill-value">{{ xiYong }}</span>
      </div>
      <div v-if="jiShen" class="xiyong-pill taboo">
        <span class="pill-label">忌用神五行</span>
        <span class="pill-value">{{ jiShen }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { getBalanceMoodClass, formatAxisValue } from '@/utils/destinyModel'

const props = defineProps({
  composite: { type: String, default: '' },
  bodySnippet: { type: String, default: '' },
  axisEntries: { type: Array, default: () => [] },
  xiYong: { type: String, default: '' },
  jiShen: { type: String, default: '' }
})

const moodClass = computed(() => getBalanceMoodClass(props.composite))
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

.balance-yinyang {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 120px;
  margin: 0 auto 16px;
  border-radius: 60px;
  overflow: hidden;
  border: 1px solid rgba(200, 155, 60, 0.15);
}

.yin.arc {
  position: absolute;
  inset: 0;
  width: 50%;
  background: linear-gradient(180deg, #0a1520, #050505);
}

.yang.arc {
  position: absolute;
  inset: 0;
  left: 50%;
  width: 50%;
  background: linear-gradient(180deg, #1a2838, #0b1c2c);
}

.mood-strong .yang.arc {
  box-shadow: inset 0 0 40px rgba(255, 107, 74, 0.12);
}

.mood-weak .yin.arc {
  box-shadow: inset 0 0 40px rgba(77, 163, 255, 0.1);
}

.balance-yinyang.mood-neutral {
  animation: neutral-spin 24s linear infinite;
}

@keyframes neutral-spin {
  to {
    filter: hue-rotate(360deg);
  }
}

.balance-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  gap: 4px;
}

.composite {
  margin: 0;
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(5, 5, 5, 0.55);
  border: 1px solid rgba(200, 155, 60, 0.25);
  font-size: clamp(13px, 3.2vw, 15px);
  letter-spacing: 0.15em;
  color: #f0e6d4;
}

.body-snippet {
  margin: 0;
  font-size: 11px;
  color: #9a9a8e;
  letter-spacing: 0.06em;
  max-width: 90%;
  text-align: center;
  line-height: 1.4;
}

.axes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 14px;
}

.axis-chip {
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(5, 5, 5, 0.35);
  border: 1px solid rgba(200, 155, 60, 0.1);
  font-size: clamp(11px, 2.8vw, 12px);
  color: #c9c4b8;
}

.axis-key {
  color: #9a9a8e;
  margin-right: 6px;
}

.xiyong-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.xiyong-pill {
  padding: 12px 20px;
  border-radius: 12px;
  min-width: min(140px, 42vw);
  text-align: center;
  border: 1px solid rgba(200, 155, 60, 0.25);
}

.xiyong-pill.favor {
  background: linear-gradient(135deg, rgba(200, 155, 60, 0.15), rgba(5, 5, 5, 0.5));
  box-shadow: 0 0 24px rgba(200, 155, 60, 0.08);
}

.xiyong-pill.taboo {
  border-color: rgba(255, 107, 74, 0.25);
  background: rgba(255, 107, 74, 0.06);
}

.pill-label {
  display: block;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: #9a9a8e;
  margin-bottom: 6px;
}

.pill-value {
  font-size: clamp(16px, 4vw, 18px);
  font-weight: 600;
  color: #e8d5a8;
}

.xiyong-pill.taboo .pill-value {
  color: #ffb4a6;
}

@media (prefers-reduced-motion: reduce) {
  .balance-yinyang.mood-neutral {
    animation: none !important;
  }
}
</style>
