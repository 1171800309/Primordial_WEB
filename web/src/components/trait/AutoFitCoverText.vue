<template>
  <div ref="rootRef" class="auto-fit-cover-text">
    <slot />
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  maxSize: { type: Number, default: 13 },
  minSize: { type: Number, default: 9 },
  fitKey: { type: [String, Number, Boolean], default: undefined }
})

const rootRef = ref(null)
let ro = null
let rafId = 0
let fitting = false
let lastSize = 0

const fit = () => {
  if (fitting) return

  const node = rootRef.value
  if (!node) return

  fitting = true

  let size = props.maxSize
  node.style.width = '100%'
  node.style.fontSize = `${size}px`

  const fits = () =>
    node.scrollWidth <= node.clientWidth + 1 &&
    node.scrollHeight <= node.clientHeight + 1

  while (size > props.minSize && !fits()) {
    size -= 1
    node.style.fontSize = `${size}px`
  }

  if (size !== lastSize) {
    lastSize = size
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

onMounted(() => {
  scheduleFit()
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    ro = new ResizeObserver(scheduleFit)
    ro.observe(rootRef.value)
  }
})

watch(() => props.fitKey, scheduleFit)

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  ro?.disconnect()
})
</script>
