<template>
  <div ref="rootRef" class="trait-title auto-fit-trait-title">
    <slot />
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, onUpdated, ref } from 'vue'

const props = defineProps({
  maxSize: { type: Number, default: 26 },
  minSize: { type: Number, default: 12 }
})

const rootRef = ref(null)
let ro = null

const fit = () => {
  const node = rootRef.value
  if (!node) return

  let size = props.maxSize
  node.style.width = '100%'
  node.style.fontSize = `${size}px`

  const fits = () => node.scrollWidth <= node.clientWidth + 1

  while (size > props.minSize && !fits()) {
    size -= 1
    node.style.fontSize = `${size}px`
  }
}

const scheduleFit = () => {
  nextTick(() => {
    fit()
    requestAnimationFrame(fit)
  })
}

onMounted(() => {
  scheduleFit()
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    ro = new ResizeObserver(scheduleFit)
    ro.observe(rootRef.value)
    if (rootRef.value.parentElement) {
      ro.observe(rootRef.value.parentElement)
    }
  }
})

onUpdated(scheduleFit)

onUnmounted(() => {
  ro?.disconnect()
})
</script>
