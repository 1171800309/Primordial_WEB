<template>
  <div class="prototype-page bianqi-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <canvas ref="canvasRef" id="bg-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <span class="brand-text">一炁文化</span>
      </router-link>
    </div>

    <a href="/hub" class="back-btn" @click.prevent="goHub">← 返回中枢</a>

    <router-link to="/wanqi" class="right-return-dot">
      <div class="return-label">返回万炁之城 →</div>
      <div class="dot-core" />
    </router-link>

    <main class="main-content">
      <h1 class="page-title">后天 · 变 · 炁域</h1>

      <div ref="segmentControlRef" class="segment-control" id="segment-control">
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
        v-show="activeTab === 'tab-dayun'"
        id="tab-dayun"
        class="tab-content"
        :class="{ active: activeTab === 'tab-dayun' }"
      >
        <div class="buff-layout">
          <div class="buff-left">
            <div :class="buffDayun.glowClass" />
            <div class="buff-label">当前大运能量场，给我的BUFF为：</div>
            <div class="buff-number-wrap">
              <span class="huge-number" :class="buffDayun.numberClass">{{ buffDayun.display }}</span>
              <span :class="buffDayun.percentClass">%</span>
              <span :class="buffDayun.statusClass">{{ buffDayun.status }}</span>
            </div>
          </div>
          <div class="buff-right">
            <div class="trait-wrapper">
              <div class="blind-box" :class="{ 'is-opened': dayunCardOpened }" @click="handleDayunCardClick">
                <div class="unopened-cover" :class="{ opened: dayunCardOpened }">
                  <div class="pending-title">待开启</div>
                  <div class="pending-sub">{{ dayunTrait.yang.title }}</div>
                  <div class="open-hint">点击开启词条</div>
                </div>
                <div class="flip-card" :class="{ 'is-yin': dayunCardYin }">
                  <div class="card-face face-yang">
                    <div class="trait-title">{{ dayunTrait.yang.title }}</div>
                    <div v-if="dayunTrait.yang.subtitle" class="trait-subtitle">{{ dayunTrait.yang.subtitle }}</div>
                    <div class="trait-desc" v-html="dayunTrait.yang.desc" />
                    <div class="toggle-dot" />
                  </div>
                  <div class="card-face face-yin">
                    <div class="trait-title">{{ dayunTrait.yin.title }}</div>
                    <div v-if="dayunTrait.yin.subtitle" class="trait-subtitle">{{ dayunTrait.yin.subtitle }}</div>
                    <div class="trait-desc" v-html="dayunTrait.yin.desc" />
                    <div class="toggle-dot" />
                  </div>
                </div>
              </div>
              <div class="trait-label">我的当前大运词条</div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-show="activeTab === 'tab-liunian'"
        id="tab-liunian"
        class="tab-content"
        :class="{ active: activeTab === 'tab-liunian' }"
      >
        <div class="buff-layout">
          <div class="buff-left">
            <div :class="buffLiunian.glowClass" />
            <div class="buff-label">今年流年能量场，给我的BUFF为：</div>
            <div class="buff-number-wrap">
              <span class="huge-number" :class="buffLiunian.numberClass">{{ buffLiunian.display }}</span>
              <span :class="buffLiunian.percentClass">%</span>
              <span :class="buffLiunian.statusClass">{{ buffLiunian.status }}</span>
            </div>
          </div>
          <div class="buff-right">
            <div class="trait-wrapper">
              <div class="blind-box" :class="{ 'is-opened': liunianCardOpened }" @click="handleLiunianCardClick">
                <div class="unopened-cover" :class="{ opened: liunianCardOpened }">
                  <div class="pending-title">待开启</div>
                  <div class="pending-sub">{{ liunianTrait.yang.title }}</div>
                  <div class="open-hint">点击开启词条</div>
                </div>
                <div class="flip-card" :class="{ 'is-yin': liunianCardYin }">
                  <div class="card-face face-yang">
                    <div class="trait-title">{{ liunianTrait.yang.title }}</div>
                    <div v-if="liunianTrait.yang.subtitle" class="trait-subtitle">{{ liunianTrait.yang.subtitle }}</div>
                    <div class="trait-desc" v-html="liunianTrait.yang.desc" />
                    <div class="toggle-dot" />
                  </div>
                  <div class="card-face face-yin">
                    <div class="trait-title">{{ liunianTrait.yin.title }}</div>
                    <div v-if="liunianTrait.yin.subtitle" class="trait-subtitle">{{ liunianTrait.yin.subtitle }}</div>
                    <div class="trait-desc" v-html="liunianTrait.yin.desc" />
                    <div class="toggle-dot" />
                  </div>
                </div>
              </div>
              <div class="trait-label">我的当前流年词条</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="traits-note">变炁数据加载中…</div>
      <div v-else-if="loadError" class="traits-note">{{ loadError }}</div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import logoUrl from '@/assets/logo.png'
import { fetchMyBianQi, openMyTraitCard } from '@/api/me'
import { useBackToHub } from '@/composables/useBackToHub'
import { usePageTransition } from '@/composables/usePageTransition'
import { useDustCanvas } from '@/composables/useDustCanvas'
import { useSegmentControl } from '@/composables/useSegmentControl'
import '@/styles/prototype-base.css'
import '@/styles/pages/变炁页.css'

const canvasRef = ref(null)
const sliderRef = ref(null)
const { loaded } = usePageTransition(500)
useDustCanvas(canvasRef)

const tabs = [
  { id: 'tab-dayun', label: '大运之炁' },
  { id: 'tab-liunian', label: '流年之炁' }
]

const { activeTab, selectTab } = useSegmentControl(sliderRef, 'tab-dayun', '.bianqi-page')

const loading = ref(false)
const loadError = ref('')
const dayunCardOpened = ref(false)
const liunianCardOpened = ref(false)
const dayunOpenSlot = ref('')
const liunianOpenSlot = ref('')
const dayunCardYin = ref(false)
const liunianCardYin = ref(false)
const goHub = useBackToHub()

const buffDayun = reactive(createBuffState())
const buffLiunian = reactive(createBuffState())

const emptyTrait = () => ({
  yang: { title: '—', subtitle: '', desc: '加载中…' },
  yin: { title: '—', subtitle: '', desc: '' }
})

const dayunTrait = ref(emptyTrait())
const liunianTrait = ref(emptyTrait())

function createBuffState() {
  return {
    display: '0',
    status: '--',
    numberClass: ['huge-number', 'decoding'],
    percentClass: ['huge-percent'],
    statusClass: ['buff-status'],
    glowClass: ['buff-bg-glow']
  }
}

function applyBuffTheme(state, targetValue) {
  const positive = targetValue >= 0
  state.status = positive ? '增幅' : '降幅'
  state.numberClass = ['huge-number', positive ? 'theme-fire' : 'theme-water']
  state.percentClass = ['huge-percent', positive ? 'theme-fire-percent' : 'theme-water-percent']
  state.statusClass = ['buff-status', positive ? 'theme-fire-text' : 'theme-water-text']
  state.glowClass = ['buff-bg-glow', positive ? 'theme-fire-glow' : 'theme-water-glow']
}

function animateBuffNumber(state, targetValue) {
  applyBuffTheme(state, targetValue)
  state.numberClass = [...state.numberClass, 'decoding']
  const duration = 2000
  let startTime = null

  const step = (timestamp) => {
    if (!startTime) startTime = timestamp
    const progress = Math.min((timestamp - startTime) / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    const currentNum = easeProgress * targetValue
    const currentText = Number(currentNum).toFixed(1)
    state.display = currentNum > 0 ? `+${currentText}` : currentText
    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      const finalText = Number(targetValue).toFixed(1)
      state.display = targetValue > 0 ? `+${finalText}` : finalText
      state.numberClass = state.numberClass.filter((c) => c !== 'decoding')
    }
  }
  requestAnimationFrame(step)
}

const applyTrait = (section, traitRef, fallback) => {
  const trait = section?.trait
  if (!trait) {
    traitRef.value = {
      yang: { title: '—', subtitle: '', desc: fallback || section?.message || '暂无词条' },
      yin: { title: '—', subtitle: '', desc: '暂无阴面释义。' }
    }
    return
  }
  traitRef.value = {
    yang: {
      title: trait.yang?.title || trait.energyLabel || '—',
      subtitle: trait.yang?.subtitle || '',
      desc: (trait.yang?.desc || '').replace(/\n/g, '<br />')
    },
    yin: {
      title: trait.yin?.title || trait.energyLabel || '',
      subtitle: trait.yin?.subtitle || '',
      desc: (trait.yin?.desc || '').replace(/\n/g, '<br />')
    }
  }
}

const loadBianQi = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await fetchMyBianQi()
    const data = res?.data ?? res
    const dayun = data?.dayun
    const liunian = data?.liunian

    if (dayun?.available) {
      dayunOpenSlot.value = dayun.openSlotId || ''
      dayunCardOpened.value = Boolean(dayun.opened)
      applyTrait(dayun, dayunTrait, dayun.traitFallback)
      animateBuffNumber(buffDayun, Number(dayun.adjustedBuffExact ?? dayun.buffExact ?? dayun.buffPercent) || 0)
    } else {
      dayunOpenSlot.value = ''
      dayunCardOpened.value = false
      applyTrait(null, dayunTrait, dayun?.message)
    }

    if (liunian?.available) {
      liunianOpenSlot.value = liunian.openSlotId || ''
      liunianCardOpened.value = Boolean(liunian.opened)
      applyTrait(liunian, liunianTrait, liunian.traitFallback)
      animateBuffNumber(buffLiunian, Number(liunian.adjustedBuffExact ?? liunian.buffExact ?? liunian.buffPercent) || 0)
    } else {
      liunianOpenSlot.value = ''
      liunianCardOpened.value = false
      applyTrait(null, liunianTrait, liunian?.message)
    }
  } catch (error) {
    loadError.value = error?.message || '变炁数据加载失败'
    ElMessage.error(loadError.value)
  } finally {
    loading.value = false
  }
}

const openBianQiCard = async (slotId, openedRef) => {
  openedRef.value = true
  if (!slotId) return
  try {
    await openMyTraitCard(slotId)
  } catch {
    /* 本地已展示，下次进入仍会从服务端同步 */
  }
}

const handleDayunCardClick = () => {
  if (!dayunCardOpened.value) {
    openBianQiCard(dayunOpenSlot.value, dayunCardOpened)
    return
  }
  dayunCardYin.value = !dayunCardYin.value
}

const handleLiunianCardClick = () => {
  if (!liunianCardOpened.value) {
    openBianQiCard(liunianOpenSlot.value, liunianCardOpened)
    return
  }
  liunianCardYin.value = !liunianCardYin.value
}

const onTabClick = (tabId, event) => {
  selectTab(tabId, event.currentTarget)
  const section = tabId === 'tab-dayun' ? buffDayun : buffLiunian
  const val = Number(String(section.display).replace('+', ''))
  if (!Number.isNaN(val) && section.display !== '0') {
    animateBuffNumber(section, val)
  }
}

onMounted(() => {
  loadBianQi()
})

watch(loaded, (val) => {
  if (val) loadBianQi()
})
</script>

<style scoped>
#bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.5;
  pointer-events: none;
}

.right-return-dot {
  text-decoration: none;
}

.bianqi-page .blind-box {
  position: relative;
  width: 100%;
  height: 320px;
  cursor: pointer;
}

.bianqi-page .blind-box:not(.is-opened) .flip-card {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.bianqi-page .unopened-cover {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px;
  text-align: center;
  border-radius: 16px;
  background: #050507;
  border: 1px solid rgba(234, 222, 199, 0.45);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.85), inset 0 0 0 1px rgba(234, 222, 199, 0.08);
  transition: opacity 0.5s ease, visibility 0.5s ease, transform 0.5s ease;
}

.bianqi-page .unopened-cover.opened {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: scale(0.98);
}

.bianqi-page .pending-title {
  font-family: var(--font-serif);
  font-size: 22px;
  color: var(--gold-light);
  letter-spacing: 0.2em;
  margin-bottom: 12px;
}

.bianqi-page .pending-sub {
  font-size: 14px;
  color: rgba(234, 222, 199, 0.82);
  line-height: 1.8;
}

.bianqi-page .open-hint {
  margin-top: 18px;
  font-size: 12px;
  color: var(--text-dark);
  letter-spacing: 0.15em;
}

.traits-note {
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 24px;
}
</style>
