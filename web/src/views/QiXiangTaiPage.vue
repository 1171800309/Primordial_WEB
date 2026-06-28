<template>
  <div class="prototype-page qixiangtai-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">一炁逆熵.炁运录<span class="en">YIQI</span></div>
      </router-link>
    </div>

    <a href="/hub" class="back-btn" @click.prevent="goHub">← 返回中枢</a>

    <main class="main-content">
      <div class="observatory-nav fade-up">
        <div class="obs-tab active">
          <div class="obs-tab-title">炁运 · 河录</div>
          <div class="obs-tab-desc">溯游流年起伏，推演命运长河</div>
        </div>
        <div class="obs-tab locked">
          <div class="obs-tab-title">
            炁性 · 维图
            <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <div class="obs-tab-desc">多维灵魂切面 (尚未解锁)</div>
        </div>
        <div class="obs-tab locked">
          <div class="obs-tab-title">
            炁场 · 光谱
            <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <div class="obs-tab-desc">能量潮汐显影 (尚未解锁)</div>
        </div>
      </div>

      <div class="chart-toolbar fade-up" style="animation-delay: 0.1s">
        <div ref="segmentControlRef" class="segment-control" id="segment-control" :data-mode="filterMode">
          <div ref="sliderRef" class="segment-slider" id="segment-slider" />
          <button
            v-for="f in filters"
            :key="f.id"
            type="button"
            class="segment-btn"
            :class="{ active: filterMode === f.id }"
            @click="onFilterClick(f.id, $event)"
          >
            {{ f.label }}
          </button>
        </div>
        <button type="button" class="edit-btn" @click="editModalOpen = true">+ 开启编辑</button>
      </div>

      <div
        ref="chartViewportRef"
        class="chart-wrapper fade-up"
        id="chart-viewport"
        style="animation-delay: 0.2s"
        @wheel.prevent="onWheel"
        @mousedown="onMouseDown"
        @touchstart.passive="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div ref="chartContentRef" class="chart-content" id="chart-content" :style="chartTransformStyle">
          <canvas ref="waveCanvasRef" id="wave-canvas" />
        </div>
        <div class="chart-controls-bottom-right">
          <div class="ctrl-btn" @click="zoomManual(0.2)">+</div>
          <div class="ctrl-btn" @click="zoomManual(-0.2)">−</div>
        </div>
      </div>

      <div class="rules-container fade-up" style="animation-delay: 0.3s">
        <div class="rules-title">命运长河判定法则</div>
        <div
          v-for="(rule, i) in rules"
          :key="i"
          class="rule-card"
          :class="{ open: openRules[i] }"
          @click="openRules[i] = !openRules[i]"
        >
          <div class="rule-header">{{ rule.title }}<span>+</span></div>
          <div class="rule-body" v-html="rule.body" />
        </div>
      </div>
    </main>

    <div class="modal-overlay" :class="{ show: editModalOpen }" id="edit-modal">
      <div class="modal-box">
        <div class="modal-close" @click="editModalOpen = false">&times;</div>
        <form @submit.prevent="submitEvent">
          <div class="form-title">撰写新炁象</div>
          <div class="form-row">
            <label class="f-label">事件发生时间</label>
            <input v-model="form.date" type="date" required />
          </div>
          <div class="form-row">
            <label class="f-label">极性 (好/坏)</label>
            <div class="radio-group">
              <label><input v-model="form.type" type="radio" value="yang" /> 起 (好事)</label>
              <label><input v-model="form.type" type="radio" value="yin" /> 伏 (坏事)</label>
            </div>
          </div>
          <div class="form-row">
            <label class="f-label">能量波动等级</label>
            <div class="radio-group vertical">
              <label v-for="lv in levelOptions" :key="lv.value" class="level-option">
                <input v-model="form.level" type="radio" :value="lv.value" />
                <span>{{ lv.label }}</span>
                <span class="help-icon" :data-tooltip="lv.tooltip">?</span>
              </label>
            </div>
          </div>
          <div class="form-row">
            <label class="f-label">简略名称</label>
            <input v-model="form.title" type="text" placeholder="例如：第一次跑完马拉松" required />
          </div>
          <div class="form-row">
            <label class="f-label">内省详情</label>
            <textarea v-model="form.desc" rows="3" placeholder="向内凝视，记下那一刻的心境与收获..." required />
          </div>
          <button type="submit" class="submit-btn">凝汇入河</button>
        </form>
      </div>
    </div>

    <div class="modal-overlay" :class="{ show: detailsModalOpen }" id="details-modal">
      <div class="modal-box">
        <div class="modal-close" @click="detailsModalOpen = false">&times;</div>
        <div class="det-header">
          <span class="det-level">{{ detailView.level }}</span>
        </div>
        <div class="det-date">{{ detailView.date }}</div>
        <div class="det-title">{{ detailView.title }}</div>
        <div class="det-desc">{{ detailView.desc }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch
} from 'vue'
import logoUrl from '@/assets/logo.png'
import { fetchMyQiEvents, createMyQiEvent } from '@/api/qiEvents'
import { QI_LEVEL_NAMES, QI_LEVEL_OPTIONS } from '@/constants/qiEventLevels'
import { useBackToHub } from '@/composables/useBackToHub'
import { usePageTransition } from '@/composables/usePageTransition'
import '@/styles/prototype-base.css'
import '@/styles/pages/气象台.css'

const CHART_WIDTH = 3000

const levelNames = QI_LEVEL_NAMES
const levelScores = { 1: 1, 2: 2, 3: 3, 4: 8, 5: 15 }

const { loaded } = usePageTransition(500)
const goHub = useBackToHub()

const sliderRef = ref(null)
const segmentControlRef = ref(null)
const chartViewportRef = ref(null)
const chartContentRef = ref(null)
const waveCanvasRef = ref(null)

const filterMode = ref('all')

const filters = [
  { id: 'yang', label: '炁' },
  { id: 'all', label: '合' },
  { id: 'yin', label: '伏' }
]

const eventsData = ref([])
const eventsLoading = ref(false)
const eventsError = ref('')

const graphDots = ref([])

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
let dragStartX = 0
let dragStartY = 0
let lastTouchX = 0
let lastTouchY = 0

const editModalOpen = ref(false)
const detailsModalOpen = ref(false)
const detailView = reactive({ level: '', date: '', title: '', desc: '' })

const form = reactive({
  date: '',
  type: 'yang',
  level: 1,
  title: '',
  desc: ''
})

const levelOptions = QI_LEVEL_OPTIONS

const openRules = ref([false])

const rules = [
  {
    title: '如何精准定级？',
    body:
      '<b>1. 身份重构：</b>发生前后，你对自己的核心认知是否改变？改变→Lv5。<br>' +
      '<b>2. 抹除测试：</b>如果抹去这件事，5年后的你会完全不同吗？<br>' +
      '<b>3. 记忆频次：</b>未来10年你会主动想起它的频率？'
  }
]

const chartTransformStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
}))

let waveRaf = 0
let timeOffset = 0
let mouseMoveHandler = null
let mouseUpHandler = null

const updateFilterSlider = (btnEl) => {
  const slider = sliderRef.value
  if (!slider || !btnEl) return
  slider.style.width = `${btnEl.offsetWidth}px`
  slider.style.transform = `translateX(${btnEl.offsetLeft - 4}px)`
}

const normalizeEvent = (item) => {
  const level = Number(item.level) || 1
  const type = item.type === 'yin' ? 'yin' : 'yang'
  const scoreBase = levelScores[level] ?? level
  return {
    id: item.id,
    date: item.date,
    type,
    level,
    title: item.title,
    desc: item.desc ?? item.description ?? '',
    score: type === 'yang' ? scoreBase : -scoreBase
  }
}

const loadEvents = async () => {
  eventsLoading.value = true
  eventsError.value = ''
  try {
    const res = await fetchMyQiEvents()
    const items = res?.data?.items ?? res?.items ?? []
    eventsData.value = items.map(normalizeEvent)
    await renderGraph()
  } catch (error) {
    eventsError.value = error?.message || '河录数据加载失败'
  } finally {
    eventsLoading.value = false
  }
}

const onFilterClick = async (mode, event) => {
  filterMode.value = mode
  updateFilterSlider(event.currentTarget)
  renderGraph()
}

const renderGraph = async () => {
  await nextTick()
  const content = chartContentRef.value
  if (!content) return

  graphDots.value.forEach((dot) => dot.el?.remove())
  graphDots.value = []

  const data = eventsData.value
  if (!data.length) return

  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date))
  const timestamps = sorted.map((e) => new Date(e.date).getTime())
  const minT = Math.min(...timestamps)
  const maxT = Math.max(...timestamps)
  const span = maxT - minT || 86400000 * 30
  const startT = minT - span * 0.15
  const endT = maxT + span * 0.15
  const chartHeight = content.offsetHeight

  sorted.forEach((ev) => {
    if (filterMode.value !== 'all' && ev.type !== filterMode.value) return

    const t = new Date(ev.date).getTime()
    const x = ((t - startT) / (endT - startT)) * CHART_WIDTH
    let y
    if (ev.type === 'yang') {
      y = chartHeight / 2 - (ev.score / 15) * (chartHeight / 2 - 30)
    } else {
      y = chartHeight / 2 + (Math.abs(ev.score) / 15) * (chartHeight / 2 - 30)
    }

    const node = document.createElement('div')
    const labelOnTop = y > chartHeight * 0.58
    node.className = `graph-node ${ev.type} lv${ev.level}${labelOnTop ? ' label-top' : ''}`
    node.style.left = `${x}px`
    node.style.top = `${y}px`

    const marker = document.createElement('div')
    marker.className = `graph-dot ${ev.type} lv${ev.level}`

    const dObj = new Date(ev.date)
    const labelDate = document.createElement('div')
    labelDate.className = 'dot-label'
    labelDate.innerText = `${dObj.getFullYear()}.${String(dObj.getMonth() + 1).padStart(2, '0')}.${String(dObj.getDate()).padStart(2, '0')}`

    node.appendChild(marker)
    node.appendChild(labelDate)
    node.addEventListener('click', (e) => {
      e.stopPropagation()
      openDetails(ev)
    })
    content.appendChild(node)
    graphDots.value.push({ el: node })
  })
}

const openDetails = (ev) => {
  detailView.level = `Lv${ev.level} ${levelNames[ev.level]}`
  detailView.date = ev.date.replace(/-/g, '.')
  detailView.title = ev.title
  detailView.desc = ev.desc
  detailsModalOpen.value = true
}

const submitEvent = async () => {
  const level = Number(form.level)
  try {
    const created = await createMyQiEvent({
      date: form.date,
      type: form.type,
      level,
      title: form.title,
      desc: form.desc
    })
    const payload = created?.data ?? created
    eventsData.value.push(normalizeEvent(payload))
    editModalOpen.value = false
    form.title = ''
    form.desc = ''
    form.level = 1
    form.type = 'yang'
    form.date = todayStr()
    await renderGraph()
  } catch (error) {
    window.alert(error?.message || '保存失败')
  }
}

const todayStr = () => {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

const initTransform = () => {
  const vp = chartViewportRef.value
  if (!vp) return
  translateX.value = -(CHART_WIDTH / 2) + vp.offsetWidth / 2
  translateY.value = 0
  scale.value = 1
}

const onWheel = (e) => {
  const delta = -e.deltaY * 0.002
  const newScale = Math.max(0.3, Math.min(scale.value * (1 + delta), 3))
  const rect = chartViewportRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  translateX.value = mouseX - (mouseX - translateX.value) * (newScale / scale.value)
  translateY.value = mouseY - (mouseY - translateY.value) * (newScale / scale.value)
  scale.value = newScale
}

const onMouseDown = (e) => {
  isDragging.value = true
  chartViewportRef.value.style.cursor = 'grabbing'
  dragStartX = e.clientX - translateX.value
  dragStartY = e.clientY - translateY.value
  mouseMoveHandler = (ev) => {
    if (!isDragging.value) return
    translateX.value = ev.clientX - dragStartX
    translateY.value = ev.clientY - dragStartY
  }
  mouseUpHandler = () => {
    isDragging.value = false
    if (chartViewportRef.value) chartViewportRef.value.style.cursor = 'grab'
    window.removeEventListener('mousemove', mouseMoveHandler)
    window.removeEventListener('mouseup', mouseUpHandler)
  }
  window.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', mouseUpHandler)
}

const onTouchStart = (e) => {
  if (e.touches.length === 1) {
    isDragging.value = true
    lastTouchX = e.touches[0].clientX
    lastTouchY = e.touches[0].clientY
  }
}

const onTouchMove = (e) => {
  if (isDragging.value && e.touches.length === 1) {
    translateX.value += e.touches[0].clientX - lastTouchX
    translateY.value += e.touches[0].clientY - lastTouchY
    lastTouchX = e.touches[0].clientX
    lastTouchY = e.touches[0].clientY
  }
}

const onTouchEnd = () => {
  isDragging.value = false
}

const zoomManual = (amount) => {
  const newScale = Math.max(0.3, Math.min(scale.value + amount, 3))
  const rect = chartViewportRef.value.getBoundingClientRect()
  const cx = rect.width / 2
  const cy = rect.height / 2
  translateX.value = cx - (cx - translateX.value) * (newScale / scale.value)
  translateY.value = cy - (cy - translateY.value) * (newScale / scale.value)
  scale.value = newScale
}

const drawWaveLoop = () => {
  const waveCanvas = waveCanvasRef.value
  const content = chartContentRef.value
  if (!waveCanvas || !content) {
    waveRaf = requestAnimationFrame(drawWaveLoop)
    return
  }
  if (waveCanvas.width !== CHART_WIDTH || waveCanvas.height !== content.offsetHeight) {
    waveCanvas.width = CHART_WIDTH
    waveCanvas.height = content.offsetHeight
  }
  const wCtx = waveCanvas.getContext('2d')
  const h = waveCanvas.height
  wCtx.clearRect(0, 0, CHART_WIDTH, h)
  wCtx.beginPath()
  const baseY = h - 30
  wCtx.moveTo(0, baseY)
  for (let x = 0; x <= CHART_WIDTH; x += 10) {
    let y = baseY + Math.sin(x * 0.004 + timeOffset) * 15
    if (filterMode.value === 'all') y += Math.cos(x * 0.008 - timeOffset * 1.2) * 8
    wCtx.lineTo(x, y)
  }
  let color = 'rgba(234, 222, 199, 0.2)'
  if (filterMode.value === 'yang') color = 'rgba(255, 255, 255, 0.2)'
  if (filterMode.value === 'yin') color = 'rgba(100, 100, 100, 0.2)'
  wCtx.strokeStyle = color
  wCtx.lineWidth = 2
  wCtx.stroke()
  timeOffset += 0.02
  waveRaf = requestAnimationFrame(drawWaveLoop)
}

onMounted(async () => {
  form.date = todayStr()
  await nextTick()
  initTransform()
  await loadEvents()
  drawWaveLoop()
  setTimeout(() => {
    const activeBtn = segmentControlRef.value?.querySelector('.segment-btn.active')
    if (activeBtn && sliderRef.value) {
      sliderRef.value.style.width = `${activeBtn.offsetWidth}px`
      sliderRef.value.style.transform = `translateX(${activeBtn.offsetLeft - 4}px)`
    }
  }, 150)
})

onUnmounted(() => {
  cancelAnimationFrame(waveRaf)
  if (mouseMoveHandler) window.removeEventListener('mousemove', mouseMoveHandler)
  if (mouseUpHandler) window.removeEventListener('mouseup', mouseUpHandler)
})

watch(loaded, async (val) => {
  if (val) {
    await nextTick()
    await loadEvents()
  }
})
</script>

<style scoped>
.chart-content {
  width: 3000px;
}
</style>
