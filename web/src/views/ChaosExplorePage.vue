<template>
  <div class="prototype-page chaos-explore-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <canvas ref="canvasRef" class="page-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">一炁文化<span class="en">YIQI</span></div>
      </router-link>
      <router-link to="/profile" class="top-right-user">个人中心</router-link>
    </div>

    <main class="chaos-explore-main">
      <div class="chaos-explore-shell">
        <a href="/hub" class="back-btn chaos-back-btn" @click.prevent="goHub">← 返回中枢</a>

        <header class="chaos-explore-header">
          <p class="page-kicker">混沌 · 探索</p>
          <h1>娱乐测试题库</h1>
          <p class="page-subtitle">混沌为锁定状态暂未上线；探索板块为娱乐测试，当前共 {{ quizzes.length || 9 }} 个测试题。</p>
        </header>

        <section class="chaos-mode-row">
          <article class="mode-card">
            <div class="section-badge">锁定状态</div>
            <h2>混沌</h2>
            <p>该板块暂未上线，当前不可进入。</p>
            <button type="button" class="section-btn" disabled>暂未开放</button>
          </article>

          <article class="mode-card">
            <div class="section-badge">娱乐测试</div>
            <h2>探索</h2>
            <p>完成测试后会自动保留结果，再次进入可直接查看。</p>
            <div class="mode-meta">{{ quizzes.length }} / 9 题库已加载</div>
          </article>
        </section>

        <section class="quiz-library-panel">
          <div class="panel-head">
            <div>
              <div class="panel-kicker">探索题库</div>
              <h2>9 宫格题库入口</h2>
            </div>
            <div class="panel-note">题名在上，类型说明在中，底部为“开始测试”</div>
          </div>

          <div v-if="loading" class="library-empty">题库加载中…</div>
          <div v-else-if="error" class="library-empty">{{ error }}</div>
          <div v-else class="quiz-library">
            <button
              v-for="quiz in quizzes"
              :key="quiz.slug"
              type="button"
              class="quiz-card"
              @click="openQuiz(quiz.slug)"
            >
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
import { onMounted, ref } from 'vue'
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
