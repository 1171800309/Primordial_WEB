<template>
  <div class="prototype-page xiantian-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <canvas ref="canvasRef" id="bg-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <span class="brand-text">一炁文化</span>
      </router-link>
      <router-link to="/wanqi" class="top-right-store">
        <span class="store-label">进入万炁之城</span>
        <div class="store-dot" />
      </router-link>
    </div>

    <a href="/hub" class="back-btn" @click.prevent="goHub">← 返回中枢</a>

    <main class="main-content">
      <h1 class="page-title">先天 . 恒 . 炁域</h1>
      <button
        v-if="activeTab === 'tab-2' && hiddenDiscovery.count > 0 && hiddenCardViewed"
        type="button"
        class="hidden-card-entry"
        @click="showHiddenPrompt = true"
      >
        <span class="entry-pulse" />
        <span class="entry-text">隐藏词卡 x{{ hiddenDiscovery.count }}</span>
      </button>

      <div class="segment-control" id="segment-control">
        <div ref="sliderRef" class="segment-slider" id="segment-slider" />
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="segment-btn"
          :class="{ active: activeTab === tab.id }"
          @click="onTabClick(tab.id, $event)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div
        id="tab-1"
        class="tab-content"
        :class="{ active: activeTab === 'tab-1' }"
      >
        <div class="qi-value-container">
          <div class="resonance-ring" />
          <div class="pre-text">你的先天恒.炁.数值为</div>
          <div class="huge-number" :class="{ decoding: qiDecoding }">{{ qiDisplay }}</div>
          <div class="post-text">
            此数值为时空坐标下的能量坍缩量化。<br />
            它是你一生运转的基石参数。
            <span v-if="qiError" class="qi-error">{{ qiError }}</span>
          </div>
        </div>
      </div>

      <div
        id="tab-2"
        class="tab-content"
        :class="{ active: activeTab === 'tab-2' }"
      >
        <div class="tab-title-sub">先天特性词卡</div>

        <div class="traits-grid-all">
          <div v-for="trait in traits" :key="trait.id" class="trait-wrapper">
            <div class="blind-box" @click="handleCardClick(trait.id)">
              <div
                class="unopened-cover"
                :class="{ 'center-text': trait.coverCenter, opened: cardStates[trait.id]?.opened }"
              >
                <CoverIcon :name="trait.iconName" />
                <span
                  v-if="trait.id === 't9' && trait.pendingPreview && !cardStates[trait.id]?.opened"
                  v-html="trait.pendingPreview"
                />
                <span v-else v-html="trait.cover" />
                <div class="open-hint">开启词卡</div>
              </div>
              <div class="flip-card" :class="[trait.tier, { 'is-yin': cardStates[trait.id]?.yin }]">
                <span
                  v-if="showTierBadge(trait)"
                  class="tier-badge"
                  :class="trait.tier"
                  :title="tierTooltip(trait)"
                >{{ tierLabel(trait) }}</span>
                <div class="card-face face-yang">
                  <div class="trait-title">{{ trait.yang.title }}</div>
                  <div v-if="trait.yang.annotation" class="trait-annotation">{{ trait.yang.annotation }}</div>
                  <div v-if="trait.yang.desc" class="trait-desc">{{ trait.yang.desc }}</div>
                  <div class="toggle-dot" />
                </div>
                <div class="card-face face-yin">
                  <div v-if="trait.yin.title" class="trait-title">{{ trait.yin.title }}</div>
                  <div class="trait-desc">{{ trait.yin.desc }}</div>
                  <div class="toggle-dot" />
                </div>
              </div>
            </div>
            <div class="trait-label">{{ trait.label }}</div>
          </div>
        </div>

        <div class="traits-footer">
          <div v-if="traitsLoading" class="traits-note">词卡加载中…</div>
          <div v-else-if="traitsError" class="traits-note">{{ traitsError }}</div>
          <div class="traits-note">说明：释义参考滴天髓等东方古籍哲学，凝视自我，不为迷信。</div>
        </div>
      </div>

      <div
        id="tab-3"
        class="tab-content"
        :class="{ active: activeTab === 'tab-3' }"
      >
        <div class="radar-container">
          <div class="radar-box">
            <div class="radar-title">{{ radarExplicit.title || '显性矩阵剖面' }}</div>
            <div class="radar-canvas-wrap">
              <canvas ref="radarExplicitRef" id="radar-explicit" />
            </div>
            <div class="radar-desc">
              代表你已向外界展现、且被世俗法则激活的维面特质。由年/月/时干十神、四柱正五行与地支本气藏干综合计算，并经月令旺衰与身旺身弱修正。
            </div>
          </div>
          <div class="radar-box">
            <div class="radar-title">{{ radarImplicit.title || '隐性矩阵剖面' }}</div>
            <div class="radar-canvas-wrap">
              <canvas ref="radarImplicitRef" id="radar-implicit" />
            </div>
            <div class="radar-desc">
              代表灵魂深处尚未完全开发、或被理性刻意压抑的潜能维度。由地支中气/余气藏干十神与四柱纳音五行叠加而成。
            </div>
          </div>
        </div>
        <div class="traits-footer">
          <div v-if="radarLoading" class="traits-note">八维图加载中…</div>
          <div v-else-if="radarError" class="traits-note">{{ radarError }}</div>
        </div>
      </div>
    </main>

    <div v-if="showHiddenPrompt" class="hidden-modal-mask" @click.self="showHiddenPrompt = false">
      <div class="hidden-modal-box">
        <div class="hidden-modal-title">隐藏词卡</div>
        <div class="hidden-modal-desc">
          {{ hiddenDiscovery.modalMessage || `你有${hiddenDiscovery.count}张隐藏词卡待开启` }}
        </div>
        <div class="hidden-modal-actions">
          <button type="button" class="modal-ghost" @click="showHiddenPrompt = false">稍后再看</button>
          <button type="button" class="modal-primary" @click="goHiddenCard">立即前往</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import logoUrl from '@/assets/logo.png'
import CoverIcon from '@/components/xiantian/CoverIcon.vue'
import { usePageTransition } from '@/composables/usePageTransition'
import { useDustCanvas } from '@/composables/useDustCanvas'
import { useSegmentControl } from '@/composables/useSegmentControl'
import { fetchMyTraitCards, fetchMyRadarCharts, openMyTraitCard } from '@/api/me'
import { resolveXianTianHenqiNumber } from '@/utils/henqi'
import { XIANTIAN_TRAIT_SLOTS, mergeTraitCards } from '@/constants/xiantianTraitSlots'
import { TIER_SLOTS, tierMetaFor } from '@/constants/traitTierMeta'
import { useBackToHub } from '@/composables/useBackToHub'
import '@/styles/prototype-base.css'
import '@/styles/pages/xiantian-page.css'

const canvasRef = ref(null)
const sliderRef = ref(null)
const radarExplicitRef = ref(null)
const radarImplicitRef = ref(null)

const { loaded } = usePageTransition(500)
useDustCanvas(canvasRef)

const tabs = [
  { id: 'tab-1', label: '恒.炁.数' },
  { id: 'tab-2', label: '恒.炁.性' },
  { id: 'tab-3', label: '八维图' }
]

const { activeTab, selectTab } = useSegmentControl(sliderRef, 'tab-1', '.xiantian-page')

const qiDisplay = ref('0')
const qiDecoding = ref(false)
const qiError = ref('')
let decodeFrameId = 0
let radarInitialized = false

const radarLoading = ref(false)
const radarError = ref('')
const radarExplicit = ref({ title: '显性矩阵剖面', values: [], labels: [] })
const radarImplicit = ref({ title: '隐性矩阵剖面', values: [], labels: [] })

const traitsLoading = ref(false)
const traitsError = ref('')
const traits = ref(mergeTraitCards(XIANTIAN_TRAIT_SLOTS))

const cardStates = reactive({})
const goHub = useBackToHub()
const router = useRouter()
const showHiddenPrompt = ref(false)
const hiddenCardViewed = ref(false)
const hiddenDiscovery = reactive({
  dayZhi: null,
  count: 0,
  showModal: false,
  modalMessage: ''
})
const hiddenViewedStorageKey = 'xq_hidden_card_viewed'
const hasShownUnlockPrompt = ref(false)
const allTraitCardsOpened = computed(() =>
  traits.value.length > 0 && traits.value.every((t) => Boolean(cardStates[t.id]?.opened))
)

const showTierBadge = (trait) => TIER_SLOTS.has(trait.id) && Boolean(trait.tier && tierMetaFor(trait.tier))
const tierLabel = (trait) => tierMetaFor(trait.tier)?.label ?? ''
const tierTooltip = (trait) => {
  const meta = tierMetaFor(trait.tier)
  return meta ? `${meta.title}：${meta.desc}` : ''
}

const syncCardStates = (list) => {
  for (const key of Object.keys(cardStates)) {
    if (!list.some((t) => t.id === key)) delete cardStates[key]
  }
  for (const t of list) {
    cardStates[t.id] = { opened: Boolean(t.opened), yin: false }
  }
}

syncCardStates(traits.value)

const loadTraitCards = async () => {
  traitsLoading.value = true
  traitsError.value = ''
  try {
    const res = await fetchMyTraitCards()
    const payload = res?.data ?? res ?? {}
    const apiCards = payload?.cards ?? []
    traits.value = mergeTraitCards(XIANTIAN_TRAIT_SLOTS, apiCards)
    syncCardStates(traits.value)
    hiddenDiscovery.dayZhi = payload?.hiddenDiscovery?.dayZhi ?? null
    hiddenDiscovery.count = Number(payload?.hiddenDiscovery?.count) || 0
    hiddenDiscovery.showModal = Boolean(payload?.hiddenDiscovery?.showModal)
    hiddenDiscovery.modalMessage = payload?.hiddenDiscovery?.modalMessage ?? ''
  } catch (error) {
    traitsError.value = error?.message || '词卡加载失败'
    ElMessage.error(traitsError.value)
  } finally {
    traitsLoading.value = false
  }
}

const formatQiNumber = (value) => String(Math.max(0, Math.floor(Number(value) || 0)))

const runDecodeAnimation = (targetNumber) => {
  const frameId = ++decodeFrameId
  const duration = 2400
  let startTime = null
  qiDecoding.value = true
  qiError.value = ''

  const animationStep = (timestamp) => {
    if (frameId !== decodeFrameId) return
    if (!startTime) startTime = timestamp
    const progress = timestamp - startTime
    const easeProgress = 1 - Math.pow(1 - Math.min(progress / duration, 1), 3)
    const currentNum = Math.floor(easeProgress * targetNumber)
    qiDisplay.value = formatQiNumber(currentNum)
    if (progress < duration) {
      requestAnimationFrame(animationStep)
    } else {
      qiDisplay.value = formatQiNumber(targetNumber)
      qiDecoding.value = false
    }
  }
  requestAnimationFrame(animationStep)
}

const loadHenqiNumber = async () => {
  decodeFrameId += 1
  qiDecoding.value = true
  qiError.value = ''
  qiDisplay.value = '0'

  try {
    const targetNumber = await resolveXianTianHenqiNumber()
    runDecodeAnimation(targetNumber)
  } catch (error) {
    qiDecoding.value = false
    qiDisplay.value = '----'
    qiError.value = error?.message || '获取先天恒炁数失败'
    ElMessage.error(qiError.value)
  }
}

const startNumberDecoding = () => {
  loadHenqiNumber()
}

const drawRadarChart = (canvasEl, dataValues, labels, isExplicit) => {
  if (!canvasEl) return
  const ctx = canvasEl.getContext('2d')
  const size = 320
  const dpr = window.devicePixelRatio || 1
  canvasEl.width = size * dpr
  canvasEl.height = size * dpr
  canvasEl.style.width = `${size}px`
  canvasEl.style.height = `${size}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const centerX = size / 2
  const centerY = size / 2
  const radius = 95
  const sides = 8
  const angleStep = (Math.PI * 2) / sides
  const axisLabels = labels?.length === sides
    ? labels
    : ['智慧谋略', '领导决断', '亲和仁爱', '行动执行', '艺术才华', '社交人缘', '稳定耐心', '理财经营']
  const values = (dataValues?.length === sides ? dataValues : axisLabels.map(() => 0))
    .map((v) => Math.max(0, Math.min(10, Number(v) || 0)))

  ctx.clearRect(0, 0, size, size)

  for (let level = 1; level <= 6; level++) {
    ctx.beginPath()
    const r = radius * (level / 6)
    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = `rgba(234, 222, 199, ${level === 6 ? 0.3 : 0.05})`
    ctx.stroke()
  }

  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep - Math.PI / 2
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius)
  }
  ctx.strokeStyle = 'rgba(234, 222, 199, 0.1)'
  ctx.stroke()

  ctx.font = '300 12px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep - Math.PI / 2
    const x = centerX + Math.cos(angle) * (radius + 30)
    const y = centerY + Math.sin(angle) * (radius + 30)
    ctx.fillText(axisLabels[i], x, y)
  }

  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep - Math.PI / 2
    const valRadius = radius * (values[i] / 10)
    const x = centerX + Math.cos(angle) * valRadius
    const y = centerY + Math.sin(angle) * valRadius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()

  if (isExplicit) {
    ctx.fillStyle = 'rgba(234, 222, 199, 0.2)'
    ctx.strokeStyle = 'rgba(234, 222, 199, 1)'
    ctx.shadowColor = 'rgba(234, 222, 199, 0.5)'
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.2)'
  }
  ctx.shadowBlur = 10
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.shadowBlur = 0

  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep - Math.PI / 2
    const valRadius = radius * (values[i] / 10)
    const x = centerX + Math.cos(angle) * valRadius
    const y = centerY + Math.sin(angle) * valRadius
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fillStyle = isExplicit ? '#FFF' : '#AAA'
    ctx.fill()
  }
}

const renderRadars = () => {
  drawRadarChart(
    radarExplicitRef.value,
    radarExplicit.value.values,
    radarExplicit.value.labels,
    true
  )
  drawRadarChart(
    radarImplicitRef.value,
    radarImplicit.value.values,
    radarImplicit.value.labels,
    false
  )
}

const loadRadarCharts = async () => {
  radarLoading.value = true
  radarError.value = ''
  try {
    const res = await fetchMyRadarCharts()
    const data = res?.data ?? res
    const explicit = data?.explicitProfile ?? {}
    const implicit = data?.implicitProfile ?? {}
    radarExplicit.value = {
      title: explicit.title || '显性矩阵剖面',
      values: explicit.values ?? [],
      labels: explicit.labels ?? []
    }
    radarImplicit.value = {
      title: implicit.title || '隐性矩阵剖面',
      values: implicit.values ?? [],
      labels: implicit.labels ?? []
    }
    await nextTick()
    renderRadars()
    radarInitialized = true
  } catch (error) {
    radarError.value = error?.message || '八维图加载失败'
    ElMessage.error(radarError.value)
  } finally {
    radarLoading.value = false
  }
}

const initRadars = () => {
  if (radarInitialized && radarExplicit.value.values.length === 8) {
    renderRadars()
    return
  }
  loadRadarCharts()
}

const onTabClick = (tabId, event) => {
  selectTab(tabId, event.currentTarget)
  if (tabId === 'tab-1') startNumberDecoding()
  if (tabId === 'tab-3' && !radarInitialized) initRadars()
}

const handleCardClick = (id) => {
  const state = cardStates[id]
  if (!state.opened) {
    state.opened = true
    openMyTraitCard(id).catch(() => {})
    maybeShowHiddenPrompt()
    return
  }
  state.yin = !state.yin
}

const goHiddenCard = () => {
  hiddenCardViewed.value = true
  localStorage.setItem(hiddenViewedStorageKey, '1')
  showHiddenPrompt.value = false
  router.push('/hidden-card')
}

const maybeShowHiddenPrompt = () => {
  if (activeTab.value !== 'tab-2') return
  if (hiddenCardViewed.value) return
  if (hiddenDiscovery.count <= 0) return
  if (!allTraitCardsOpened.value) return
  if (hasShownUnlockPrompt.value) return
  hasShownUnlockPrompt.value = true
  showHiddenPrompt.value = true
}

const onResize = () => {
  if (radarInitialized && radarExplicit.value.values.length === 8) renderRadars()
}

onMounted(async () => {
  hiddenCardViewed.value = localStorage.getItem(hiddenViewedStorageKey) === '1'
  loadTraitCards()
  await nextTick()
  const buttons = document.querySelectorAll('.xiantian-page .segment-btn')
  const activeIndex = tabs.findIndex((t) => t.id === activeTab.value)
  const activeBtn = buttons[activeIndex]
  if (activeBtn) selectTab(activeTab.value, activeBtn)

  if (activeTab.value === 'tab-1') {
    setTimeout(loadHenqiNumber, 600)
  }
  if (activeTab.value === 'tab-3') {
    setTimeout(initRadars, 300)
  }
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

watch(loaded, (val) => {
  if (val && activeTab.value === 'tab-1') loadHenqiNumber()
})

watch(activeTab, () => {
  maybeShowHiddenPrompt()
})

watch(allTraitCardsOpened, () => {
  maybeShowHiddenPrompt()
})
</script>

<style scoped>
.top-right-store {
  text-decoration: none;
}

.hidden-card-entry {
  position: absolute;
  right: 5%;
  top: 128px;
  z-index: 30;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(234, 222, 199, 0.4);
  border-radius: 999px;
  background: rgba(8, 8, 10, 0.7);
  color: var(--gold-light);
  padding: 8px 14px;
  cursor: pointer;
}

.entry-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gold-light);
  box-shadow: 0 0 10px rgba(234, 222, 199, 0.9);
  animation: entryPulse 1.6s ease-in-out infinite;
}

.entry-text {
  font-size: 12px;
  letter-spacing: 0.1em;
}

.hidden-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden-modal-box {
  width: min(460px, 90vw);
  border-radius: 14px;
  border: 1px solid rgba(234, 222, 199, 0.35);
  background: #0d0d10;
  padding: 26px 24px;
}

.hidden-modal-title {
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--gold-light);
  margin-bottom: 10px;
}

.hidden-modal-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.9;
}

.hidden-modal-actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-ghost,
.modal-primary {
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
}

.modal-ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-white);
}

.modal-primary {
  border: 1px solid var(--gold-light);
  background: var(--gold-light);
  color: #111;
}

@keyframes entryPulse {
  0%,
  100% { transform: scale(0.9); opacity: 0.65; }
  50% { transform: scale(1.15); opacity: 1; }
}
</style>
