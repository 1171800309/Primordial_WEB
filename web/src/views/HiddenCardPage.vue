<template>
  <div v-if="visibleCards.length" class="prototype-page hidden-card-page">
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
        <div class="brand-text">一炁逆熵.炁运录<span class="en">YIQI</span></div>
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

      <TraitCardCarousel :items="carouselItems" :max-slide-height="carouselMaxHeight">
        <template #default="{ item: card }">
          <div
            class="blind-box"
            @click.stop="handleCardClick(card.id)"
            @pointerdown.stop
          >
            <div
              class="trait-card-meta"
              :class="{ 'is-on-yin': cardStates[card.id]?.opened && cardStates[card.id]?.yin }"
            >
              <span class="trait-card-label">{{ card.label }}</span>
            </div>
            <div class="unopened-cover" :class="{ opened: cardStates[card.id]?.opened }">
              <AutoFitCoverText :max-size="15" :min-size="10">
                <span v-html="card.cover" />
              </AutoFitCoverText>
            </div>
            <div class="flip-card" :class="{ 'is-yin': cardStates[card.id]?.yin }">
              <div class="card-face face-yang">
                <AutoFitTraitCardBody :fit-key="`${card.id}-yang-${cardStates[card.id]?.yin}`">
                  <AutoFitTraitTitle :max-size="34" :min-size="18" :fit-key="`${card.id}-yang-title`">
                    {{ card.yang.title }}
                  </AutoFitTraitTitle>
                  <div v-if="card.yang.annotation" class="trait-annotation">{{ card.yang.annotation }}</div>
                  <div v-if="card.yang.desc" class="trait-desc">{{ card.yang.desc }}</div>
                </AutoFitTraitCardBody>
                <div class="toggle-dot" />
              </div>
              <div class="card-face face-yin">
                <AutoFitTraitCardBody :fit-key="`${card.id}-yin-${cardStates[card.id]?.yin}`">
                  <AutoFitTraitTitle
                    v-if="card.yin.title"
                    :max-size="34"
                    :min-size="18"
                    :fit-key="`${card.id}-yin-title-${cardStates[card.id]?.yin}`"
                  >
                    {{ card.yin.title }}
                  </AutoFitTraitTitle>
                  <div v-if="card.yin.annotation" class="trait-annotation">{{ card.yin.annotation }}</div>
                  <div v-if="card.yin.desc" class="trait-desc">{{ card.yin.desc }}</div>
                </AutoFitTraitCardBody>
                <div class="toggle-dot" />
              </div>
            </div>
          </div>
        </template>
      </TraitCardCarousel>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logoUrl from '@/assets/logo.png'
import { fetchMyTraitCards, openMyTraitCard } from '@/api/me'
import { HIDDEN_TRAIT_CARD_SLOTS, mergeHiddenTraitCards } from '@/constants/hiddenTraitCards'
import { useDustCanvas } from '@/composables/useDustCanvas'
import AutoFitCoverText from '@/components/trait/AutoFitCoverText.vue'
import AutoFitTraitCardBody from '@/components/trait/AutoFitTraitCardBody.vue'
import AutoFitTraitTitle from '@/components/trait/AutoFitTraitTitle.vue'
import TraitCardCarousel from '@/components/trait/TraitCardCarousel.vue'
import '@/styles/prototype-base.css'
import '@/styles/pages/隐藏词卡.css'

const canvasRef = ref(null)
useDustCanvas(canvasRef)

const router = useRouter()
const route = useRoute()
const modalHidden = ref(false)
const contentRevealed = ref(false)
const visibleCards = ref([])
const hiddenCardsCacheKey = 'xq_hidden_cards_cache'
const carouselItems = computed(() =>
  visibleCards.value.map((c) => ({ key: c.id, label: c.label, ...c }))
)

const discovery = ref({
  dayZhi: null,
  count: 0,
  showModal: false,
  modalMessage: null
})

const cardStates = reactive({})

// 单视口完整显示：按窗口高度约束词卡高度，避免页面出现滚动
const carouselMaxHeight = ref(360)
const syncCarouselMaxHeight = () => {
  carouselMaxHeight.value = Math.round(
    Math.max(220, Math.min(460, window.innerHeight - 300))
  )
}

const syncCardStates = (cards) => {
  for (const key of Object.keys(cardStates)) {
    if (!cards.some((c) => c.id === key)) delete cardStates[key]
  }
  for (const card of cards) {
    cardStates[card.id] = { opened: Boolean(card.opened), yin: false }
  }
}

const applyDiscovery = (payload) => {
  discovery.value = payload
  if (!payload.showModal) {
    modalHidden.value = true
    contentRevealed.value = true
  }
}

const loadDiscovery = async () => {
  try {
    const res = await fetchMyTraitCards()
    const data = res?.data ?? res
    let apiCards = data?.hiddenCards ?? []
    if (!apiCards.length) {
      try {
        const cached = sessionStorage.getItem(hiddenCardsCacheKey)
        if (cached) apiCards = JSON.parse(cached)
      } catch {
        apiCards = []
      }
    }
    const cards = mergeHiddenTraitCards(HIDDEN_TRAIT_CARD_SLOTS, apiCards)

    if (!cards.length) {
      router.replace('/xiantian')
      return
    }

    visibleCards.value = cards
    syncCardStates(visibleCards.value)

    const remote = data?.hiddenDiscovery
    // 从先天页「查看隐藏词卡」进入时（reveal=1）直接展示词卡，不再弹一次「机缘触发」
    const skipModal = route.query.reveal === '1'
    applyDiscovery({
      dayZhi: remote?.dayZhi ?? null,
      count: cards.length,
      showModal: skipModal ? false : Boolean(remote?.showModal),
      modalMessage: remote?.modalMessage ?? null
    })
  } catch {
    router.replace('/xiantian')
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
    openMyTraitCard(id).catch(() => {})
  } else {
    state.yin = !state.yin
  }
}

onMounted(() => {
  syncCarouselMaxHeight()
  window.addEventListener('resize', syncCarouselMaxHeight, { passive: true })
  loadDiscovery()
})

onUnmounted(() => {
  window.removeEventListener('resize', syncCarouselMaxHeight)
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
</style>
