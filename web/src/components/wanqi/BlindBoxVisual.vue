<template>
  <div class="blind-box-visual" :class="[`blind-box-visual--${variant}`, sizeClass]">
    <div class="blind-box-visual__glow" aria-hidden="true" />
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" aria-hidden="true">
      <polygon
        points="50,55 85,35 85,75 50,95"
        fill="rgba(20,20,25,0.9)"
        stroke="rgba(234,222,199,0.4)"
        stroke-width="1.5"
      />
      <polygon
        points="15,35 50,55 50,95 15,75"
        fill="rgba(15,15,18,0.9)"
        stroke="rgba(234,222,199,0.3)"
        stroke-width="1.5"
      />
      <polygon
        points="50,15 85,35 50,55 15,35"
        fill="rgba(25,25,30,0.9)"
        stroke="rgba(234,222,199,0.5)"
        stroke-width="1.5"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'wanqi',
    validator: (v) => ['wanqi', 'guaiqi'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  }
})

const sizeClass = computed(() => `blind-box-visual--${props.size}`)
</script>

<style scoped>
.blind-box-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: boxFloat 4s ease-in-out infinite;
}

.blind-box-visual--sm {
  width: 110px;
  height: 110px;
}

.blind-box-visual--md {
  width: 140px;
  height: 140px;
}

.blind-box-visual--lg {
  width: 160px;
  height: 160px;
}

.blind-box-visual__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  z-index: 0;
  animation: glowPulse 3s ease-in-out infinite alternate;
}

.blind-box-visual--sm .blind-box-visual__glow {
  width: 140px;
  height: 140px;
}

.blind-box-visual--md .blind-box-visual__glow,
.blind-box-visual--lg .blind-box-visual__glow {
  width: 180px;
  height: 180px;
}

.blind-box-visual svg {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  transition: filter 0.3s ease;
}

.blind-box-visual--wanqi .blind-box-visual__glow {
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0.22) 38%,
    transparent 72%
  );
}

.blind-box-visual--wanqi svg {
  filter: drop-shadow(0 0 14px rgba(255, 255, 255, 0.65))
    drop-shadow(0 0 28px rgba(255, 255, 255, 0.25));
}

.blind-box-visual--guaiqi .blind-box-visual__glow {
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(12, 12, 16, 0.85) 42%,
    transparent 74%
  );
  box-shadow: 0 0 36px rgba(0, 0, 0, 0.95);
}

.blind-box-visual--guaiqi svg {
  filter: drop-shadow(0 0 16px rgba(0, 0, 0, 0.95))
    drop-shadow(0 0 6px rgba(60, 60, 68, 0.45));
}

@keyframes boxFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@keyframes glowPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.88);
    opacity: 0.65;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.12);
    opacity: 1;
  }
}
</style>
