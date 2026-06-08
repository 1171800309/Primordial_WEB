<template>
  <div ref="rootRef" class="trait-title auto-fit-trait-title">
    <slot />
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  maxSize: { type: Number, default: 26 },
  minSize: { type: Number, default: 12 },
  fitKey: { type: [String, Number, Boolean], default: undefined }
})

const rootRef = ref(null)
let ro = null
let rafId = 0
let fitting = false

const fit = () => {
  if (fitting) return

  const node = rootRef.value
  if (!node) return

  fitting = true

  let size = props.maxSize
  node.style.width = '100%'
  node.style.whiteSpace = 'nowrap'
  node.style.fontSize = `${size}px`

  const fits = () =>
    node.scrollWidth <= node.clientWidth + 1 && node.scrollHeight <= node.clientHeight + 2

  while (size > props.minSize && !fits()) {
    size -= 1
    node.style.fontSize = `${size}px`
  }

  fitting = false
}

const scheduleFit = () => {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    rafId = 0
    nextTick(fit)
  })
}

watch(() => props.fitKey, scheduleFit)

onMounted(() => {
  scheduleFit()
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    ro = new ResizeObserver(scheduleFit)
    ro.observe(rootRef.value)
  }
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  ro?.disconnect()
})
</script>
