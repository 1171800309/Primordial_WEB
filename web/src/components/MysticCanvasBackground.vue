<template>
  <div class="mystic-bg" :class="{ 'mystic-bg--mobile': isNarrow }" aria-hidden="true">
    <canvas ref="canvasRef" class="mystic-canvas" />
    <div class="mystic-fog" />
    <div class="mystic-bagua" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)
const isNarrow = ref(false)
let raf = 0
let stars = []
let w = 0
let h = 0
let dpr = 1
let start = 0

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = window.innerWidth
  h = window.innerHeight
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`

  isNarrow.value = w < 768
  const count = w < 768 ? 34 : w < 1024 ? 72 : 110
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.2 + 0.2,
    phase: Math.random() * Math.PI * 2,
    speed: 0.35 + Math.random() * 0.5
  }))
}

const draw = (t) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const elapsed = (t - start) / 1000
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#050505')
  g.addColorStop(0.35, '#07141f')
  g.addColorStop(0.7, '#0b1c2c')
  g.addColorStop(1, '#050508')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  if (prefersReducedMotion()) {
    ctx.fillStyle = 'rgba(232, 228, 220, 0.55)'
    for (const s of stars) {
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
    return
  }

  for (const s of stars) {
    const tw = 0.35 + 0.35 * Math.sin(elapsed * s.speed + s.phase)
    ctx.beginPath()
    ctx.fillStyle = `rgba(232, 228, 220, ${0.15 + tw * 0.45})`
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fill()
  }

  /* 极轻「灵气」漂移粒子（少量）；窄屏再减 */
  const dustCap = w < 768 ? 8 : 18
  const dust = Math.min(dustCap, Math.floor(stars.length / 8))
  for (let i = 0; i < dust; i++) {
    const j = (i * 17) % stars.length
    const s = stars[j]
    const dx = Math.sin(elapsed * 0.08 + i) * 12
    const dy = Math.cos(elapsed * 0.06 + i * 0.7) * 8
    ctx.fillStyle = `rgba(77, 163, 255, ${0.04 + 0.06 * Math.sin(elapsed + i)})`
    ctx.beginPath()
    ctx.arc(s.x + dx, s.y + dy, 0.8, 0, Math.PI * 2)
    ctx.fill()
  }
}

const loop = (t) => {
  if (!start) start = t
  draw(t)
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  resize()
  start = 0
  window.addEventListener('resize', resize)
  if (prefersReducedMotion()) {
    draw(performance.now())
    return
  }
  raf = requestAnimationFrame(loop)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  cancelAnimationFrame(raf)
})
</script>

<style scoped>
.mystic-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.mystic-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.mystic-fog {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 100%, rgba(11, 28, 44, 0.5), transparent 55%),
    radial-gradient(ellipse 60% 40% at 20% 30%, rgba(124, 92, 255, 0.06), transparent 50%),
    radial-gradient(ellipse 50% 35% at 80% 20%, rgba(77, 163, 255, 0.05), transparent 45%);
  animation: mystic-fog-drift 28s ease-in-out infinite;
}

@keyframes mystic-fog-drift {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.92;
    transform: scale(1.02);
  }
}

.mystic-bagua {
  position: absolute;
  left: 50%;
  top: 42%;
  width: min(120vw, 900px);
  height: min(120vw, 900px);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(200, 155, 60, 0.04) 0deg,
    transparent 45deg,
    rgba(77, 163, 255, 0.03) 90deg,
    transparent 135deg,
    rgba(200, 155, 60, 0.05) 180deg,
    transparent 225deg,
    rgba(124, 92, 255, 0.03) 270deg,
    transparent 315deg,
    rgba(200, 155, 60, 0.04) 360deg
  );
  mask: radial-gradient(circle, transparent 42%, black 43%, black 48%, transparent 50%);
  -webkit-mask: radial-gradient(circle, transparent 42%, black 43%, black 48%, transparent 50%);
  opacity: 0.35;
  animation: mystic-bagua-spin 140s linear infinite;
}

@keyframes mystic-bagua-spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mystic-fog,
  .mystic-bagua {
    animation: none !important;
  }
}

/* <768：法阵约 70% 视觉权重，雾与轨道减弱 */
.mystic-bg--mobile .mystic-fog {
  opacity: 0.72;
  animation-duration: 40s;
}

.mystic-bg--mobile .mystic-bagua {
  width: min(84vw, 630px);
  height: min(84vw, 630px);
  opacity: 0.22;
  animation-duration: 200s;
}
</style>
