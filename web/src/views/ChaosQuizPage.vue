<template>
  <div class="prototype-page chaos-quiz-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <canvas ref="canvasRef" class="page-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
      </router-link>
      <router-link to="/profile" class="top-right-user">个人中心</router-link>
    </div>

    <main class="chaos-quiz-main" :class="{ 'is-result-mode': stage === 'result' }">
      <div class="chaos-quiz-shell">
        <a href="/chaos-explore" class="back-btn chaos-back-btn" @click.prevent="goList">
          {{ stage === 'result' ? '← 返回' : '← 返回题库' }}
        </a>

        <div v-if="loading" class="quiz-empty">测试加载中…</div>
        <div v-else-if="error" class="quiz-empty">{{ error }}</div>
        <template v-else>
          <section v-if="stage === 'quiz' && currentQuestion" class="question-card">
            <div class="question-progress">
              <span>第 {{ currentIndex + 1 }} / {{ questionCount }} 题</span>
              <span v-if="submitting">结果生成中…</span>
            </div>
            <div class="question-prompt">{{ cleanText(currentQuestion.prompt) }}</div>
            <button
              v-for="option in currentQuestion.options"
              :key="option.key"
              type="button"
              class="question-option"
              :disabled="submitting"
              @click="selectOption(option.key)"
            >
              <span>{{ option.key }}.</span>
              <span>{{ cleanText(option.text) }}</span>
            </button>
          </section>

          <section v-else-if="stage === 'summary'" class="result-prelude-card">
            <div class="prelude-label">测试完成</div>
            <div class="prelude-text">{{ cleanText(quiz.introText) }}</div>
            <button type="button" class="primary-pill" @click="showResult">查看结果</button>
          </section>

          <section v-else-if="result" class="quiz-result-layout">
            <div class="result-card-shell">
              <div
                class="result-card"
                :class="{ 'is-yin': showYin }"
                role="button"
                tabindex="0"
                @click="toggleFace"
                @keydown.enter.prevent="toggleFace"
                @keydown.space.prevent="toggleFace"
              >
                <div class="card-face face-yang">
                  <AutoFitTraitCardBody :fit-key="`result-yang-${showYin}`">
                    <AutoFitTraitTitle :max-size="30" :min-size="16" :fit-key="`result-yang-title-${showYin}`">
                      {{ cleanText(result.title) }}
                    </AutoFitTraitTitle>
                    <div v-if="result.summary" class="result-summary">{{ cleanText(result.summary) }}</div>
                    <div class="result-body">{{ cleanText(result.yang) }}</div>
                  </AutoFitTraitCardBody>
                  <button
                    type="button"
                    class="toggle-dot"
                    aria-label="切换结果阴阳面"
                    @click.stop="toggleFace"
                  />
                </div>
                <div class="card-face face-yin">
                  <AutoFitTraitCardBody :fit-key="`result-yin-${showYin}`">
                    <AutoFitTraitTitle :max-size="30" :min-size="16" :fit-key="`result-yin-title-${showYin}`">
                      {{ cleanText(result.title) }}
                    </AutoFitTraitTitle>
                    <div v-if="result.summary" class="result-summary">{{ cleanText(result.summary) }}</div>
                    <div class="result-body">{{ cleanText(result.yin) }}</div>
                  </AutoFitTraitCardBody>
                  <button
                    type="button"
                    class="toggle-dot"
                    aria-label="切换结果阴阳面"
                    @click.stop="toggleFace"
                  />
                </div>
              </div>
            </div>

            <div class="result-actions">
              <button type="button" class="ghost-pill" @click="restartQuiz">重新测试</button>
            </div>
          </section>
          <section v-else class="quiz-empty">暂无可用题目</section>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logoUrl from '@/assets/logo.png'
import { fetchChaosQuizDetail, resetChaosQuiz, submitChaosQuiz } from '@/api/chaos'
import AutoFitTraitCardBody from '@/components/trait/AutoFitTraitCardBody.vue'
import AutoFitTraitTitle from '@/components/trait/AutoFitTraitTitle.vue'
import { useDustCanvas } from '@/composables/useDustCanvas'
import { usePageTransition } from '@/composables/usePageTransition'
import '@/styles/prototype-base.css'
import '@/styles/pages/chaos-quiz.css'

const route = useRoute()
const router = useRouter()
const canvasRef = ref(null)
const loading = ref(false)
const error = ref('')
const quiz = ref({
  title: '',
  summary: '',
  introText: '',
  outroText: '',
  questions: []
})
const answers = ref({})
const currentIndex = ref(0)
const stage = ref('quiz')
const result = ref(null)
const showYin = ref(false)
const submitting = ref(false)
const { loaded } = usePageTransition(500)

useDustCanvas(canvasRef)

const questionCount = computed(() => quiz.value.questions?.length ?? 0)
const currentQuestion = computed(() => quiz.value.questions?.[currentIndex.value] ?? null)

const cleanText = (value) => String(value ?? '').replace(/\*\*/g, '')

const goList = () => {
  router.push({ name: 'chaos-explore' })
}

const resetLocalQuizState = () => {
  answers.value = {}
  currentIndex.value = 0
  stage.value = 'quiz'
  result.value = null
  showYin.value = false
  submitting.value = false
}

const hydrateSavedAttempt = (savedAttempt) => {
  if (!savedAttempt) return
  answers.value = Object.fromEntries(
    Object.entries(savedAttempt.answers || {}).map(([key, value]) => [Number(key), value])
  )
  result.value = savedAttempt.result
  stage.value = 'result'
}

const loadQuiz = async () => {
  loading.value = true
  error.value = ''
  resetLocalQuizState()
  try {
    const res = await fetchChaosQuizDetail(route.params.slug)
    quiz.value = {
      ...res.data,
      questions: res.data.questions || []
    }
    hydrateSavedAttempt(res.data.savedAttempt)
  } catch (err) {
    error.value = err?.message || '测试加载失败'
  } finally {
    loading.value = false
  }
}

const selectOption = async (optionKey) => {
  if (submitting.value) return
  const questionId = currentQuestion.value?.id
  if (!questionId) return

  answers.value = {
    ...answers.value,
    [questionId]: optionKey
  }

  if (currentIndex.value < questionCount.value - 1) {
    currentIndex.value += 1
    return
  }

  try {
    submitting.value = true
    const res = await submitChaosQuiz(route.params.slug, answers.value)
    if (!res?.data?.result) {
      throw new Error('结果数据为空')
    }
    result.value = res.data.result
    stage.value = 'summary'
  } catch (err) {
    error.value = err?.message || '提交测试失败'
  } finally {
    submitting.value = false
  }
}

const showResult = () => {
  stage.value = 'result'
}

const toggleFace = () => {
  showYin.value = !showYin.value
}

const restartQuiz = async () => {
  try {
    await resetChaosQuiz(route.params.slug)
    resetLocalQuizState()
  } catch (err) {
    error.value = err?.message || '重置测试失败'
  }
}

onMounted(loadQuiz)
</script>
