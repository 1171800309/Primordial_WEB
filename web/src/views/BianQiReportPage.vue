<template>
  <div class="prototype-page bianqi-report-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <canvas ref="canvasRef" id="report-bg-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">一炁逆熵.炁运录<span class="en">YIQI</span></div>
      </router-link>
    </div>

    <a href="/hub" class="back-btn" @click.prevent="goHub">← 返回中枢</a>

    <main class="report-main">
      <div class="report-actions fade-up">
        <router-link to="/bianqi" class="report-ghost-link">返回变炁域</router-link>
        <div class="report-tabs" role="tablist" aria-label="报告类型">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="report-tab"
            :class="{ active: activeTab === tab.id }"
            :aria-selected="activeTab === tab.id"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <section v-if="loading" class="report-state fade-up">报告加载中...</section>
      <section v-else-if="loadError" class="report-state report-state--error fade-up">{{ loadError }}</section>

      <section v-else class="report-layout fade-up" style="animation-delay: 0.08s">
        <article class="report-article">
          <template v-if="!currentSection?.available">
            <h2>{{ currentSection?.message || '暂无报告' }}</h2>
            <p>当前档案还没有可用于生成后天报告的运程数据。</p>
          </template>

          <template v-else-if="!currentReport">
            <h2>报告暂未匹配</h2>
            <p>{{ currentSection?.reportFallback || '暂无匹配长报告，请确认后天报告词库已导入。' }}</p>
          </template>

          <template v-else-if="activeTab === 'dayun'">
            <h2>{{ currentReport.title || '大运深度分析' }}</h2>
            <section
              v-for="block in articleBlocks"
              :key="block.title"
              class="article-block"
            >
              <h3>{{ block.title }}</h3>
              <p>{{ block.body }}</p>
            </section>
          </template>

          <template v-else>
            <h2>{{ currentReport.annualTheme || '流年关键提示' }}</h2>
            <ol v-if="currentReport.keyItems?.length" class="key-list">
              <li v-for="item in currentReport.keyItems" :key="item">{{ item }}</li>
            </ol>
            <section v-if="currentReport.specialReminder" class="article-block article-block--reminder">
              <h3>特别提醒</h3>
              <p>{{ currentReport.specialReminder }}</p>
            </section>
          </template>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import logoUrl from '@/assets/logo.png'
import { fetchMyBianQi } from '@/api/me'
import { useBackToHub } from '@/composables/useBackToHub'
import { usePageTransition } from '@/composables/usePageTransition'
import { useDustCanvas } from '@/composables/useDustCanvas'
import '@/styles/prototype-base.css'
import '@/styles/pages/bianqi-report.css'

const canvasRef = ref(null)
const route = useRoute()
const { loaded } = usePageTransition(500)
const goHub = useBackToHub()
useDustCanvas(canvasRef)

const tabs = [
  { id: 'dayun', label: '大运报告' },
  { id: 'liunian', label: '流年提示' }
]

const normalizeReportTab = (value) => {
  const raw = Array.isArray(value) ? value[0] : value
  return raw === 'liunian' ? 'liunian' : 'dayun'
}

const activeTab = ref(normalizeReportTab(route.query.tab))
const loading = ref(false)
const loadError = ref('')
const bianqi = ref(null)

const currentSection = computed(() => bianqi.value?.[activeTab.value] || null)
const currentReport = computed(() => currentSection.value?.report || null)

const articleBlocks = computed(() => {
  const report = currentReport.value
  if (!report) return []
  return [
    { title: '总览', body: report.overview },
    { title: '事业', body: report.career },
    { title: '财富', body: report.wealth },
    { title: '感情', body: report.relationship },
    { title: '健康', body: report.health },
    { title: '关键提醒', body: report.keyReminder }
  ].filter((block) => block.body)
})

async function loadReport() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await fetchMyBianQi()
    bianqi.value = res?.data ?? res
  } catch (error) {
    loadError.value = error?.message || '后天报告加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadReport)

watch(loaded, (val) => {
  if (val) loadReport()
})

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = normalizeReportTab(tab)
  }
)
</script>
