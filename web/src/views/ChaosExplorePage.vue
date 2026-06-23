<template>
  <div class="prototype-page chaos-explore-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <canvas ref="canvasRef" class="page-canvas" />
    <svg class="explore-svg-defs" aria-hidden="true">
      <defs>
        <linearGradient id="explore-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff512f" />
          <stop offset="100%" stop-color="#dd2476" />
        </linearGradient>
        <linearGradient id="explore-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00f2fe" />
          <stop offset="100%" stop-color="#4facfe" />
        </linearGradient>
        <linearGradient id="explore-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f9d423" />
          <stop offset="100%" stop-color="#ff4e50" />
        </linearGradient>
        <linearGradient id="explore-purple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8a2387" />
          <stop offset="50%" stop-color="#e94057" />
          <stop offset="100%" stop-color="#f27121" />
        </linearGradient>
        <linearGradient id="explore-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#11998e" />
          <stop offset="100%" stop-color="#38ef7d" />
        </linearGradient>
      </defs>
    </svg>

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">一炁逆熵.炁运录<span class="en">YIQI</span></div>
      </router-link>
      <div class="chaos-tabs" aria-label="混沌探索导航">
        <button type="button" class="chaos-tab is-locked" disabled>
          <span class="lock-mark" aria-hidden="true">⌁</span>
          混沌
        </button>
        <button type="button" class="chaos-tab is-active">探索</button>
      </div>
      <router-link to="/profile" class="top-right-user">个人中心</router-link>
    </div>

    <main class="chaos-explore-main">
      <div class="chaos-explore-shell">
        <a href="/hub" class="back-btn chaos-back-btn" @click.prevent="goHub">← 返回中枢</a>

        <section class="explore-matrix-panel" aria-label="探索题库">
          <div v-if="loading" class="library-empty">
            <span class="matrix-spinner" aria-hidden="true" />
            正在链接后端题库…
          </div>
          <div v-else-if="error" class="library-empty">{{ error }}</div>
          <div v-else-if="orderedQuizzes.length === 0" class="library-empty">暂无可用测试</div>
          <div v-else class="quiz-library">
            <button
              v-for="(quiz, index) in orderedQuizzes"
              :key="quiz.slug"
              type="button"
              class="quiz-card"
              @click="openQuiz(quiz.slug)"
            >
              <svg
                class="cover-totem"
                viewBox="0 0 100 100"
                aria-hidden="true"
                v-html="getQuizVisual(quiz.slug, index).svg"
              />
              <div class="quiz-card-index">{{ getQuizVisual(quiz.slug, index).id }}</div>
              <div class="quiz-card-title">{{ quiz.title }}</div>
              <div class="quiz-card-desc">{{ quiz.summary }}</div>
              <div class="quiz-card-footer">
                <span>{{ quiz.hasSavedResult ? '查看结果' : '开始测试' }}</span>
                <span>{{ quiz.questionCount }} 题</span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '@/assets/logo.png'
import { fetchChaosQuizHub } from '@/api/chaos'
import { useBackToHub } from '@/composables/useBackToHub'
import { useDustCanvas } from '@/composables/useDustCanvas'
import { usePageTransition } from '@/composables/usePageTransition'
import '@/styles/prototype-base.css'
import '@/styles/pages/chaos-explore.css'

const router = useRouter()
const canvasRef = ref(null)
const loading = ref(false)
const error = ref('')
const quizzes = ref([])
const goHub = useBackToHub()
const { loaded } = usePageTransition(500)

useDustCanvas(canvasRef)

const MATRIX_ORDER = [
  'family-pattern',
  'circle-role',
  'inner-power',
  'worldview-core',
  'life-narrative',
  'highlight-traits',
  'animal-instinct',
  'workplace-species',
  'startup-species'
]

const QUIZ_VISUALS = {
  'family-pattern': {
    id: '01',
    svg: '<polygon points="50,15 85,85 15,85" stroke="url(#explore-orange)" stroke-width="2"/><path d="M50 15v70M15 85h70" stroke="url(#explore-orange)" stroke-width="1"/><circle cx="50" cy="60" r="15" stroke="var(--gold-light)" stroke-width="1"/>'
  },
  'circle-role': {
    id: '02',
    svg: '<circle cx="50" cy="50" r="40" stroke="url(#explore-cyan)" stroke-width="1.5"/><circle cx="50" cy="50" r="25" stroke="url(#explore-cyan)" stroke-dasharray="4 6" stroke-width="2"/><circle cx="50" cy="50" r="8" fill="url(#explore-cyan)"/>'
  },
  'inner-power': {
    id: '03',
    svg: '<path d="M50 10L90 75H10z" stroke="url(#explore-gold)" stroke-width="2"/><path d="M50 30L75 70H25z" stroke="var(--gold-light)" stroke-width="1"/><circle cx="50" cy="55" r="5" fill="var(--gold-legendary)"/>'
  },
  'worldview-core': {
    id: '04',
    svg: '<rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" stroke="url(#explore-green)" stroke-width="2"/><circle cx="50" cy="50" r="18" stroke="url(#explore-green)" stroke-width="1"/><circle cx="50" cy="50" r="5" fill="url(#explore-green)"/>'
  },
  'life-narrative': {
    id: '05',
    svg: '<path d="M30 20C70 20 70 80 30 80M70 20C30 20 30 80 70 80" stroke="url(#explore-purple)" stroke-width="2"/><line x1="50" y1="10" x2="50" y2="90" stroke="var(--gold-light)" stroke-width="1"/>'
  },
  'highlight-traits': {
    id: '06',
    svg: '<path d="M55 10L25 55h25l-10 35 45-50H50z" fill="none" stroke="url(#explore-gold)" stroke-width="2"/><circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>'
  },
  'animal-instinct': {
    id: '07',
    svg: '<path d="M20 50 Q 50 20 80 50 Q 50 80 20 50" stroke="url(#explore-orange)" stroke-width="2"/><circle cx="50" cy="50" r="12" stroke="var(--gold-legendary)" stroke-width="1.5"/><line x1="50" y1="38" x2="50" y2="62" stroke="var(--gold-legendary)"/>'
  },
  'workplace-species': {
    id: '08',
    svg: '<circle cx="50" cy="50" r="30" stroke="url(#explore-cyan)" stroke-dasharray="10 5" stroke-width="2"/><rect x="40" y="35" width="20" height="30" rx="3" stroke="var(--gold-light)" stroke-width="1.5"/><line x1="50" y1="35" x2="50" y2="65" stroke="var(--gold-legendary)"/>'
  },
  'startup-species': {
    id: '09',
    svg: '<polygon points="50,10 80,90 20,90" stroke="url(#explore-purple)" stroke-width="1.5"/><polygon points="50,90 80,10 20,10" stroke="url(#explore-gold)" stroke-width="1.5"/><circle cx="50" cy="50" r="8" fill="var(--gold-legendary)"/>'
  }
}

const orderedQuizzes = computed(() => {
  const position = new Map(MATRIX_ORDER.map((slug, index) => [slug, index]))
  return [...quizzes.value].sort((a, b) => {
    const aIndex = position.has(a.slug) ? position.get(a.slug) : Number.MAX_SAFE_INTEGER
    const bIndex = position.has(b.slug) ? position.get(b.slug) : Number.MAX_SAFE_INTEGER
    return aIndex - bIndex
  })
})

const getQuizVisual = (slug, index) =>
  QUIZ_VISUALS[slug] || {
    id: String(index + 1).padStart(2, '0'),
    svg: QUIZ_VISUALS['worldview-core'].svg
  }

const loadHub = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetchChaosQuizHub()
    quizzes.value = res?.data?.quizzes ?? []
  } catch (err) {
    error.value = err?.message || '题库加载失败'
  } finally {
    loading.value = false
  }
}

const openQuiz = (slug) => {
  router.push({ name: 'chaos-quiz', params: { slug } })
}

onMounted(loadHub)
</script>
