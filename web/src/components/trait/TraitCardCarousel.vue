<template>
  <div
    ref="rootRef"
    class="trait-showcase"
    tabindex="0"
    @keydown="onKeydown"
  >
    <div class="trait-showcase-counter" v-if="items.length > 1">
      {{ activeIndex + 1 }} / {{ items.length }}
    </div>

    <div class="trait-showcase-stage">
      <button
        v-if="items.length > 1"
        type="button"
        class="trait-showcase-nav prev"
        aria-label="上一张词卡"
        @click="goBy(-1)"
      >
        ‹
      </button>

      <div
        ref="viewportRef"
        class="trait-showcase-viewport"
        :style="viewportStyle"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerUp"
      >
        <div class="trait-showcase-track" :style="trackStyle">
          <div
            v-for="(item, index) in items"
            :key="item.key ?? index"
            class="trait-showcase-slide"
            :class="slideClass(index)"
          >
            <TraitCardFrame :active="index === activeIndex">
              <slot
                :item="item"
                :index="index"
                :active="index === activeIndex"
              />
            </TraitCardFrame>
          </div>
        </div>
      </div>

      <button
        v-if="items.length > 1"
        type="button"
        class="trait-showcase-nav next"
        aria-label="下一张词卡"
        @click="goBy(1)"
      >
        ›
      </button>
    </div>

    <PaginationDots
      v-if="items.length"
      :items="items"
      :active-index="activeIndex"
      @select="goTo"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import TraitCardFrame from '@/components/trait/TraitCardFrame.vue'
import PaginationDots from '@/components/trait/PaginationDots.vue'
import '@/styles/components/trait-carousel.css'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  /** Cap card height (px) for one-screen layouts; no observer loops */
  maxSlideHeight: {
    type: Number,
    default: null
  }
})

const rootRef = ref(null)
const viewportRef = ref(null)
const activeIndex = ref(0)
const slideWidth = ref(380)
const slideGap = 28
const dragDelta = ref(0)
const dragging = ref(false)
const pointerStartX = ref(0)
const pointerId = ref(null)

const clampIndex = (index) =>
  Math.min(props.items.length - 1, Math.max(0, index))

const slideClass = (index) => {
  const offset = index - activeIndex.value
  return {
    'is-active': offset === 0,
    'is-prev': offset === -1,
    'is-next': offset === 1,
    'is-far': Math.abs(offset) > 1
  }
}

const slideHeight = computed(() => Math.round(slideWidth.value * 1.5))

const viewportStyle = computed(() => ({
  '--slide-w': `${slideWidth.value}px`,
  '--slide-h': `${slideHeight.value}px`,
  height: `${slideHeight.value}px`
}))

const trackStyle = computed(() => {
  const viewport = viewportRef.value
  const vw = viewport?.clientWidth ?? 0
  const center = vw / 2
  const activeCenter =
    activeIndex.value * (slideWidth.value + slideGap) + slideWidth.value / 2
  const x = center - activeCenter + dragDelta.value
  const transition = dragging.value ? 'none' : 'transform 0.58s cubic-bezier(0.22, 1, 0.36, 1)'

  return {
    transform: `translate3d(${x}px, 0, 0)`,
    transition,
    '--slide-w': `${slideWidth.value}px`,
    '--slide-h': `${slideHeight.value}px`,
    '--slide-gap': `${slideGap}px`
  }
})

const measureSlide = () => {
  const viewport = viewportRef.value
  if (!viewport) return

  const vw = viewport.clientWidth
  const isMobile = window.matchMedia('(max-width: 768px)').matches

  if (isMobile) {
    slideWidth.value = Math.min(Math.max(vw * 0.72, 240), 320)
  } else {
    slideWidth.value = Math.min(Math.max(vw * 0.36, 300), 360)
  }

  if (props.maxSlideHeight != null && props.maxSlideHeight > 0) {
    const maxWidth = Math.floor(props.maxSlideHeight / 1.5)
    slideWidth.value = Math.min(slideWidth.value, maxWidth)
  }
}

const goTo = (index) => {
  if (!props.items.length) return
  activeIndex.value = clampIndex(index)
}

const goBy = (delta) => {
  goTo(activeIndex.value + delta)
}

const onKeydown = (event) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    goBy(-1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    goBy(1)
  }
}

const onPointerDown = (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  if (event.target.closest('.blind-box, .trait-showcase-nav, .pagination-dot')) return
  dragging.value = true
  pointerId.value = event.pointerId
  pointerStartX.value = event.clientX
  dragDelta.value = 0
  viewportRef.value?.setPointerCapture?.(event.pointerId)
}

const onPointerMove = (event) => {
  if (!dragging.value || event.pointerId !== pointerId.value) return
  dragDelta.value = event.clientX - pointerStartX.value
}

const onPointerUp = (event) => {
  if (!dragging.value) return
  if (event?.pointerId != null && event.pointerId !== pointerId.value) return

  const threshold = Math.min(80, slideWidth.value * 0.18)
  if (dragDelta.value < -threshold) goBy(1)
  else if (dragDelta.value > threshold) goBy(-1)

  dragging.value = false
  dragDelta.value = 0
  pointerId.value = null
}

let resizeObserver = null

onMounted(() => {
  measureSlide()
  nextTick(measureSlide)

  if (typeof ResizeObserver !== 'undefined' && viewportRef.value) {
    resizeObserver = new ResizeObserver(() => measureSlide())
    resizeObserver.observe(viewportRef.value)
  } else {
    window.addEventListener('resize', measureSlide)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', measureSlide)
})

watch(
  () => props.items.length,
  () => {
    activeIndex.value = 0
    nextTick(measureSlide)
  }
)

watch(
  () => props.maxSlideHeight,
  () => nextTick(measureSlide)
)
</script>
