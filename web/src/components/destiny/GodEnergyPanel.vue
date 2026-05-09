<template>
  <section v-if="entries.length" class="block god-block">
    <h3 class="block-title"><span class="title-glow">天干十神之炁</span></h3>
    <div class="god-grid">
      <div
        v-for="[name, raw] in entries"
        :key="name"
        class="god-chip"
        :class="chipClass(name)"
      >
        <span class="god-name">{{ name }}</span>
        <span class="god-val">{{ displayVal(raw) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { getTenGodChipClass } from '@/utils/destinyModel'

const props = defineProps({
  data: { type: Object, default: null }
})

const entries = computed(() => {
  const o = props.data
  if (!o || typeof o !== 'object') return []
  return Object.entries(o).filter(([k]) => !['喜用十神', '忌用十神', '喜用', '忌用'].includes(k))
})

const chipClass = (name) => getTenGodChipClass(name)

const displayVal = (raw) => {
  if (raw == null) return '—'
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') return String(raw)
  try {
    return JSON.stringify(raw)
  } catch {
    return '—'
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

.god-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(140px, 100%), 1fr));
  gap: 10px;
}

.god-chip {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(200, 155, 60, 0.12);
  background: rgba(5, 5, 5, 0.4);
  transition: transform 0.25s ease, border-color 0.25s ease;
}

.god-chip:active {
  transform: scale(0.98);
}

.god-name {
  display: block;
  font-size: 12px;
  color: #c9b896;
  margin-bottom: 6px;
  letter-spacing: 0.12em;
}

.god-val {
  font-size: clamp(11px, 2.8vw, 12px);
  color: #e8e4dc;
  line-height: 1.45;
  word-break: break-all;
}

.god-kill {
  border-color: rgba(255, 107, 74, 0.25);
  box-shadow: 0 0 12px rgba(255, 107, 74, 0.06);
}

.god-seal {
  border-color: rgba(200, 155, 60, 0.3);
}

.god-rob {
  border-color: rgba(200, 155, 60, 0.15);
  animation: rob-shake 4s ease-in-out infinite;
}

@keyframes rob-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(1px);
  }
}

.god-default {
  border-color: rgba(255, 255, 255, 0.06);
}

@media (prefers-reduced-motion: reduce) {
  .god-rob {
    animation: none !important;
  }
}
</style>
