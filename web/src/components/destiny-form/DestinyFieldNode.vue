<template>
  <article
    class="destiny-node"
    :class="[
      `node--${variant}`,
      {
        'node--empty': !hasContent,
        'node--active': active,
        'node--mobile': isMobile,
        'node--visible': ready,
        'node--day': emphasize
      }
    ]"
    :style="{ '--stagger': stagger }"
    role="button"
    tabindex="0"
    @click="onActivate"
    @keydown.enter.prevent="onActivate"
    @keydown.space.prevent="onActivate"
  >
    <span class="node-orbit" aria-hidden="true" />
    <span class="node-scan" aria-hidden="true" />
    <span class="node-dust" aria-hidden="true" />
    <header class="node-head">
      <span class="node-rune-line" aria-hidden="true" />
      <h4 class="node-title">{{ title }}</h4>
      <p v-if="subtitle" class="node-sub">{{ subtitle }}</p>
    </header>
    <div class="node-core">
      <template v-if="!ready">
        <span class="node-chaos" aria-hidden="true">炁</span>
      </template>
      <template v-else>
        <p v-if="multiline" class="node-val node-val--multi">{{ display }}</p>
        <p v-else class="node-val">{{ display }}</p>
      </template>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  value: { type: String, default: '' },
  multiline: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
  /** 出场错序：与父级 --stagger 相乘 */
  stagger: { type: Number, default: 0 },
  ready: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  /** 日柱强化：命主本源 */
  emphasize: { type: Boolean, default: false }
})

const active = ref(false)

const hasContent = computed(() => String(props.value || '').trim().length > 0)

const display = computed(() => {
  const s = String(props.value || '').trim()
  return s || '暂无天机'
})

const onActivate = () => {
  active.value = true
  window.setTimeout(() => {
    active.value = false
  }, 420)
}
</script>

<style scoped>
.destiny-node {
  --gold: #c89b3c;
  --gold-dim: rgba(200, 155, 60, 0.35);
  position: relative;
  text-align: center;
  padding: 14px 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(200, 155, 60, 0.28);
  background: linear-gradient(165deg, rgba(11, 28, 44, 0.92), rgba(5, 5, 5, 0.78));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 12px 32px rgba(0, 0, 0, 0.45);
  cursor: pointer;
  overflow: hidden;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  opacity: 0;
  transform: translate3d(0, 18px, 0) scale(0.97);
  transition:
    opacity 0.65s ease,
    transform 0.65s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
  transition-delay: calc(var(--stagger) * 55ms);
}

.destiny-node.node--visible {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

.node-orbit {
  position: absolute;
  inset: -35%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, rgba(200, 155, 60, 0.06), transparent 40%, rgba(77, 163, 255, 0.05), transparent 70%);
  animation: orbit-drift 18s linear infinite;
  pointer-events: none;
  opacity: 0.5;
}

.node-scan {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 42%, rgba(255, 255, 255, 0.06) 50%, transparent 58%);
  transform: translateX(-100%);
  animation: gold-scan 4.5s ease-in-out infinite;
  pointer-events: none;
  opacity: 0.55;
}

.node-dust {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(232, 228, 220, 0.12) 1px, transparent 1px);
  background-size: 14px 18px;
  opacity: 0.12;
  animation: dust-float 6s ease-in-out infinite;
  pointer-events: none;
}

.node-head {
  position: relative;
  margin-bottom: 10px;
}

.node-rune-line {
  display: block;
  width: 42%;
  height: 1px;
  margin: 0 auto 8px;
  background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
}

.node-title {
  margin: 0;
  font-size: clamp(11px, 2.6vw, 12px);
  font-weight: 600;
  letter-spacing: 0.28em;
  text-indent: 0.28em;
  color: #e8d5a8;
  text-shadow: 0 0 14px rgba(200, 155, 60, 0.25);
}

.node-sub {
  margin: 6px 0 0;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: #6b7280;
}

.node-core {
  position: relative;
  min-height: 2.6em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-chaos {
  font-size: 22px;
  letter-spacing: 0.4em;
  color: rgba(200, 155, 60, 0.35);
  animation: chaos-pulse 1.2s ease-in-out infinite;
}

.node-val {
  margin: 0;
  font-size: clamp(14px, 3.6vw, 17px);
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #f0e6d4;
  line-height: 1.45;
  word-break: break-word;
}

.node-val--multi {
  font-size: clamp(12px, 3.1vw, 14px);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-align: left;
  max-height: 7.5em;
  overflow: auto;
  width: 100%;
  padding-right: 4px;
}

.node--pillar .node-title {
  color: #f0e6d4;
}

.node--xi {
  border-color: rgba(79, 175, 108, 0.32);
}

.node--ji {
  border-color: rgba(255, 107, 74, 0.28);
}

.node--na .node-title {
  letter-spacing: 0.22em;
}

.node--day {
  border-color: rgba(200, 155, 60, 0.42);
  box-shadow:
    0 0 0 1px rgba(200, 155, 60, 0.12) inset,
    0 0 28px rgba(200, 155, 60, 0.12);
}

.node--day .node-title {
  text-shadow: 0 0 18px rgba(200, 155, 60, 0.45);
}

.node--verdict {
  text-align: left;
}

.node--verdict .node-core {
  justify-content: flex-start;
}

.node--verdict .node-head {
  text-align: left;
}

.node--verdict .node-rune-line {
  margin-left: 0;
  margin-right: auto;
}

@media (hover: hover) and (pointer: fine) {
  .destiny-node:hover {
    border-color: rgba(200, 155, 60, 0.55);
    box-shadow:
      0 0 0 1px rgba(200, 155, 60, 0.15) inset,
      0 0 28px rgba(200, 155, 60, 0.12),
      0 16px 40px rgba(0, 0, 0, 0.5);
  }

  .destiny-node:hover .node-orbit {
    opacity: 0.85;
    animation-duration: 12s;
  }
}

.node--active {
  border-color: rgba(77, 163, 255, 0.5);
  box-shadow:
    0 0 0 1px rgba(77, 163, 255, 0.22) inset,
    0 0 40px rgba(77, 163, 255, 0.18);
}

.node--mobile {
  padding: 12px 10px 14px;
}

.node--mobile .node-orbit {
  opacity: 0.28;
  animation-duration: 26s;
}

.node--mobile .node-scan {
  animation: none;
  opacity: 0.2;
}

.node--mobile .node-dust {
  opacity: 0.06;
  animation: none;
}

@keyframes orbit-drift {
  to {
    transform: rotate(360deg);
  }
}

@keyframes gold-scan {
  0%,
  35% {
    transform: translateX(-100%);
  }
  70%,
  100% {
    transform: translateX(100%);
  }
}

@keyframes dust-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes chaos-pulse {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.85;
  }
}

@media (prefers-reduced-motion: reduce) {
  .destiny-node {
    transition: opacity 0.3s ease;
    transform: none !important;
  }

  .node-orbit,
  .node-scan,
  .node-dust,
  .node-chaos {
    animation: none !important;
  }
}
</style>
