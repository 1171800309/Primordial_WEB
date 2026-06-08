<template>
  <div
    ref="hostRef"
    class="trait-card-body-host"
    :class="{ 'is-scrollable': scrollable }"
  >
    <div
      ref="contentRef"
      class="trait-card-body"
      :style="contentStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  fitKey: { type: [String, Number, Boolean], default: undefined }
})

const MIN_SCALE = 0.58

const hostRef = ref(null)
const contentRef = ref(null)
const scale = ref(1)
const scrollable = ref(false)
let ro = null
let rafId = 0
let fitting = false

const contentStyle = computed(() => {
  if (scale.value >= 0.999) return undefined
  return {
    transform: `scale(${scale.value})`,
    transformOrigin: 'center center'
  }
})

const fit = () => {
  if (fitting) return

  const host = hostRef.value
  const content = contentRef.value
  if (!host || !content) return

  fitting = true

  const availableH = host.clientHeight
  const availableW = host.clientWidth
  if (availableH <= 0 || availableW <= 0) {
    fitting = false
    return
  }

  const naturalH = content.scrollHeight
  const naturalW = content.scrollWidth
  let next = 1
  let nextScrollable = false

  if (naturalH > availableH || naturalW > availableW) {
    const scaleH = availableH / naturalH
    const scaleW = availableW / naturalW
    next = Math.min(scaleH, scaleW)
    if (next < MIN_SCALE) {
      next = MIN_SCALE
      nextScrollable =
        naturalH * MIN_SCALE > availableH + 1 || naturalW * MIN_SCALE > availableW + 1
    }
  }

  if (Math.abs(next - scale.value) > 0.004) {
    scale.value = next
  }
  scrollable.value = nextScrollable

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
  if (typeof ResizeObserver !== 'undefined' && hostRef.value) {
    ro = new ResizeObserver(scheduleFit)
    ro.observe(hostRef.value)
  }
})

watch(() => props.fitKey, scheduleFit)

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  ro?.disconnect()
})
</script>
