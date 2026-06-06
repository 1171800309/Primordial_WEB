<template>
  <div class="register-loading-page">
    <MysticCanvasBackground />

    <div class="register-loading-body">
      <div class="register-loading-center">
        <img
          :src="logoUrl"
          alt="一炁"
          class="register-loading-logo ink-blend"
          :style="{ animationDuration: `${spinDurationSec}s` }"
        />

        <div class="register-loading-text-stage">
          <Transition :name="transitionName" mode="out-in">
            <div :key="stepIndex" class="register-loading-text-block">
              <p class="register-loading-label">{{ currentStep.label }}</p>
              <p v-if="currentStep.detail" class="register-loading-detail">{{ currentStep.detail }}</p>
            </div>
          </Transition>
        </div>
      </div>

      <footer class="register-loading-footer">
        <p class="register-loading-classics">{{ classicsText }}</p>
        <p class="register-loading-disclaimer">{{ disclaimerText }}</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '@/assets/logo.png'
import MysticCanvasBackground from '@/components/MysticCanvasBackground.vue'
import {
  REGISTER_LOADING_CLASSICS,
  REGISTER_LOADING_DISCLAIMER,
  REGISTER_LOADING_SESSION_KEY
} from '@/constants/registerLoadingClassics'
import { readStoredBaziAnalysis } from '@/utils/baziAnalysis'
import {
  buildRegisterLoadingSteps,
  getLogoSpinDurationSec,
  REGISTER_LOADING_DURATIONS_MS
} from '@/utils/registerLoadingSequence'
import '@/styles/pages/register-loading.css'

const router = useRouter()
const classicsText = REGISTER_LOADING_CLASSICS
const disclaimerText = REGISTER_LOADING_DISCLAIMER

const steps = ref(buildRegisterLoadingSteps(readStoredBaziAnalysis()))
const stepIndex = ref(0)
const spinDurationSec = ref(4)
const transitionName = ref('loading-flash')

const currentStep = computed(() => steps.value[stepIndex.value] || { label: '加载中…' })

let timers = []
let startedAt = 0
let totalMs = 0

const clearTimers = () => {
  timers.forEach((id) => clearTimeout(id))
  timers = []
}

const schedule = (fn, delay) => {
  const id = window.setTimeout(fn, delay)
  timers.push(id)
  return id
}

const updateSpinByProgress = () => {
  if (!totalMs) return
  const progress = Math.min(1, (Date.now() - startedAt) / totalMs)
  spinDurationSec.value = getLogoSpinDurationSec(progress)
}

const runSequence = () => {
  clearTimers()
  startedAt = Date.now()
  totalMs = REGISTER_LOADING_DURATIONS_MS.reduce((sum, ms) => sum + ms, 0)
  stepIndex.value = 0
  updateSpinByProgress()

  const spinTicker = window.setInterval(updateSpinByProgress, 120)
  timers.push(spinTicker)

  let elapsed = 0
  REGISTER_LOADING_DURATIONS_MS.forEach((duration, index) => {
    if (index === 0) return
    elapsed += REGISTER_LOADING_DURATIONS_MS[index - 1]
    schedule(() => {
      stepIndex.value = index
      transitionName.value = index >= steps.value.length - 2 ? 'loading-flash-slow' : 'loading-flash'
      updateSpinByProgress()
    }, elapsed)
  })

  schedule(() => {
    sessionStorage.removeItem(REGISTER_LOADING_SESSION_KEY)
    router.replace({ name: 'hub' })
  }, totalMs + 400)
}

onMounted(() => {
  if (sessionStorage.getItem(REGISTER_LOADING_SESSION_KEY) !== '1') {
    router.replace({ name: 'hub' })
    return
  }
  steps.value = buildRegisterLoadingSteps(readStoredBaziAnalysis())
  runSequence()
})

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<style scoped>
.ink-blend {
  mix-blend-mode: screen;
}
</style>
