<template>
  <div class="prototype-page hidden-card-page">
    <canvas ref="canvasRef" id="bg-canvas" />
    <div class="holy-glow" />

    <div
      v-if="discovery.showModal"
      id="discovery-modal"
      :class="{ hidden: modalHidden }"
    >
      <div class="modal-box">
        <div class="modal-ring" />
        <div class="modal-title">机缘触发</div>
        <div class="modal-desc">{{ discovery.modalMessage }}</div>
        <button type="button" class="reveal-btn" @click="revealCards">查看隐藏词卡</button>
      </div>
    </div>

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <span class="brand-text">一炁文化</span>
      </router-link>
    </div>

    <router-link to="/xiantian" class="nav-dot-btn left">
      <div class="dot-core" />
      <div class="nav-label">← 返回恒炁域</div>
    </router-link>

    <router-link to="/wanqi" class="nav-dot-btn right">
      <div class="dot-core" />
      <div class="nav-label">进入万炁之城 →</div>
    </router-link>

    <main class="main-content" :class="{ revealed: contentRevealed }">
      <h1 class="page-title">隐藏词卡</h1>
      <div class="page-subtitle">HIDDEN TRAITS</div>

      <div v-if="visibleCards.length" class="ur-cards-container">
        <div v-for="card in visibleCards" :key="card.id" class="ur-card-wrapper">
          <div class="blind-box" @click="handleCardClick(card.id)">
            <div class="unopened-cover" :class="{ opened: cardStates[card.id]?.opened }">
              <span v-html="card.cover" />
            </div>
            <div class="flip-card" :class="{ 'is-yin': cardStates[card.id]?.yin }">
              <div class="card-face face-yang">
                <div class="trait-title">{{ card.yang.title }}</div>
                <div class="trait-annotation">{{ card.yang.annotation }}</div>
                <div class="trait-desc">{{ card.yang.desc }}</div>
                <div class="toggle-dot" />
              </div>
              <div class="card-face face-yin">
                <div class="trait-desc">{{ card.yin.desc }}</div>
                <div class="toggle-dot" />
              </div>
            </div>
          </div>
          <div class="trait-label-bottom">{{ card.label }}</div>
        </div>
      </div>

      <p v-else-if="!loading" class="empty-note">你的日柱无隐藏词卡，可直接返回先天恒炁域继续探索。</p>
      <p v-else class="empty-note">加载中…</p>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import logoUrl from '@/assets/logo.png'
import { fetchMyTraitCards } from '@/api/me'
import { HIDDEN_TRAIT_CARD_SLOTS, resolveHiddenDiscovery } from '@/constants/hiddenTraitCards'
import { useDustCanvas } from '@/composables/useDustCanvas'
import '@/styles/prototype-base.css'
import '@/styles/pages/隐藏词卡.css'

const canvasRef = ref(null)
useDustCanvas(canvasRef)

const loading = ref(true)
const modalHidden = ref(false)
const contentRevealed = ref(false)
const discovery = ref({
  dayZhi: null,
  count: 0,
  showModal: false,
  modalMessage: null
})

const cardStates = reactive(
  Object.fromEntries(HIDDEN_TRAIT_CARD_SLOTS.map((c) => [c.id, { opened: false, yin: false }]))
)

const visibleCards = computed(() =>
  HIDDEN_TRAIT_CARD_SLOTS.slice(0, Math.max(0, discovery.value.count))
)

const applyDiscovery = (payload) => {
  discovery.value = payload
  if (!payload.showModal) {
    modalHidden.value = true
    contentRevealed.value = true
  }
}

const loadDiscovery = async () => {
  loading.value = true
  try {
    const res = await fetchMyTraitCards()
    const data = res?.data ?? res
    const remote = data?.hiddenDiscovery
    if (remote && typeof remote.count === 'number') {
      applyDiscovery({
        dayZhi: remote.dayZhi ?? null,
        count: remote.count,
        showModal: Boolean(remote.showModal),
        modalMessage: remote.modalMessage ?? null
      })
      return
    }
    const dayZhi = data?.keys?.dayZhi ?? data?.keys?.dayPillar?.slice(1)
    applyDiscovery(resolveHiddenDiscovery(dayZhi))
  } catch {
    applyDiscovery(resolveHiddenDiscovery(null))
  } finally {
    loading.value = false
  }
}

const revealCards = () => {
  modalHidden.value = true
  contentRevealed.value = true
}

const handleCardClick = (id) => {
  const state = cardStates[id]
  if (!state.opened) {
    state.opened = true
  } else {
    state.yin = !state.yin
  }
}

onMounted(() => {
  loadDiscovery()
})
</script>

<style scoped>
#bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.8;
  pointer-events: none;
}

.empty-note {
  margin-top: 48px;
  font-size: 14px;
  color: var(--text-muted);
  letter-spacing: 0.12em;
  text-align: center;
  line-height: 2;
}
</style>
