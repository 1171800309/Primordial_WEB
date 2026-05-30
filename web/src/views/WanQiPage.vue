<template>
  <div class="prototype-page wanqi-page">
    <div class="page-transition" :class="{ loaded }">
      <div class="transition-ring" />
    </div>

    <canvas ref="canvasRef" id="bg-canvas" />

    <div class="top-nav">
      <router-link to="/hub" class="top-left-brand">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">一炁文化<span class="en">YIQI</span></div>
      </router-link>
    </div>

    <router-link
      to="/hub"
      class="left-return-dot"
      :style="hubReturnStyle"
    >
      <div class="dot-core" />
      <div class="return-label">← 返回能量中枢</div>
    </router-link>

    <a
      href="#"
      class="left-return-dot"
      :style="storeReturnStyle"
      @click.prevent="closeStore"
    >
      <div class="dot-core" />
      <div class="return-label">← 返回万炁之门</div>
    </a>

    <div id="portal-view" class="view-container" :class="{ 'view-active': !storeOpen, 'bg-mode': storeOpen }">
      <div class="locked-section">
        <div class="lock-overlay">
          <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <div class="lock-text">炁机未至，暂未开放</div>
        </div>

        <div class="locked-content">
          <img :src="logoUrl" alt="一炁" class="center-logo ink-blend" />
          <div class="portal-title">万炁之城</div>

          <div class="portals-grid">
            <div v-for="portal in portals" :key="portal.name" class="portal-item">
              <div class="portal-icon" v-html="portal.icon" />
              <div class="portal-name">{{ portal.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="unlocked-section">
        <div class="mystery-box-wrapper" @click="openStore">
          <div class="mystery-box-icon">
            <div class="mystery-box-glow" />
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <polygon points="50,55 85,35 85,75 50,95" fill="rgba(20,20,25,0.9)" stroke="rgba(234,222,199,0.4)" stroke-width="1.5" />
              <polygon points="15,35 50,55 50,95 15,75" fill="rgba(15,15,18,0.9)" stroke="rgba(234,222,199,0.3)" stroke-width="1.5" />
              <polygon points="50,15 85,35 50,55 15,35" fill="rgba(25,25,30,0.9)" stroke="rgba(234,222,199,0.5)" stroke-width="1.5" />
              <ellipse cx="50" cy="35" rx="10" ry="5" stroke="#b464ff" stroke-width="1" fill="rgba(180,100,255,0.2)" />
              <circle cx="50" cy="35" r="2" fill="#ff4e50">
                <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
          <div class="box-name">怪炁盲盒</div>
        </div>
      </div>
    </div>

    <div id="store-view" class="view-container" :class="{ 'view-active': storeOpen, 'view-hidden': !storeOpen }">
      <div class="top-right-user">
        <a href="#" class="icon-btn" @click.prevent>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          炁匣
        </a>
        <router-link to="/profile" class="icon-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          归处
        </router-link>
      </div>

      <div class="store-content">
        <div class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-wrapper">
            <div
              class="product-card"
              :class="{ 'is-yin': flippedProducts[product.id] }"
              @click="onProductClick(product.id, $event)"
            >
              <div :class="['card-face', 'face-yang', product.boxClass]">
                <div class="product-img"><div class="abstract-qi" /></div>
                <div class="product-info">
                  <div class="product-title">{{ product.title }}</div>
                  <div class="product-price">{{ product.price }}</div>
                  <div class="product-desc">{{ product.desc }}</div>
                  <div class="toggle-btn"><div class="toggle-dot" /></div>
                </div>
              </div>
              <div :class="['card-face', 'face-yin', product.boxClass]">
                <div class="product-img"><div class="abstract-qi" /></div>
                <div class="product-info">
                  <div class="product-title">{{ product.title }}</div>
                  <div class="product-price">{{ product.price }}</div>
                  <div class="product-desc">{{ product.desc }}</div>
                  <div class="toggle-btn"><div class="toggle-dot" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import logoUrl from '@/assets/logo.png'
import { usePageTransition } from '@/composables/usePageTransition'
import { useDustCanvas } from '@/composables/useDustCanvas'
import '@/styles/prototype-base.css'
import '@/styles/pages/万炁之城1.css'

const canvasRef = ref(null)
const { loaded } = usePageTransition(500)
useDustCanvas(canvasRef)

const storeOpen = ref(false)
const flippedProducts = reactive({})

const hubReturnStyle = computed(() =>
  storeOpen.value
    ? { opacity: 0, visibility: 'hidden', pointerEvents: 'none' }
    : { opacity: 1, visibility: 'visible', pointerEvents: 'auto' }
)

const storeReturnStyle = computed(() =>
  storeOpen.value
    ? { opacity: 1, visibility: 'visible', pointerEvents: 'auto' }
    : { opacity: 0, visibility: 'hidden', pointerEvents: 'none' }
)

const portals = [
  { name: '眼', icon: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><path d="M10,50 Q50,15 90,50 Q50,85 10,50" stroke-width="3"/><circle cx="50" cy="50" r="16"/><circle cx="50" cy="50" r="6" fill="currentColor"/></svg>' },
  { name: '耳', icon: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><path d="M60,20 A30,30 0 1,0 60,80 A20,20 0 1,1 60,40 A10,10 0 1,0 60,60" stroke-width="3" stroke-linecap="round"/></svg>' },
  { name: '鼻', icon: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><path d="M50,85 C40,85 35,75 40,65 C45,55 50,45 50,25" stroke-width="3" stroke-linecap="round"/><path d="M50,85 C60,85 65,75 60,65 C55,55 50,45 50,25" stroke-width="3" stroke-linecap="round"/></svg>' },
  { name: '舌', icon: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><path d="M50,15 C80,50 80,85 50,85 C20,85 20,50 50,15 Z" stroke-width="3"/><line x1="50" y1="40" x2="50" y2="75" stroke-linecap="round"/></svg>' },
  { name: '触', icon: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><circle cx="50" cy="50" r="10" fill="currentColor"/><circle cx="50" cy="50" r="16" stroke-dasharray="4 4"/><path d="M38,38 Q10,20 15,5 T5,15" stroke-width="2"/><path d="M62,62 Q90,80 85,95 T95,85" stroke-width="2"/></svg>' }
]

const products = [
  { id: 'p1', boxClass: 'box-1', title: '名称待定', price: '¥ 50.00', desc: '介绍待定...' },
  { id: 'p2', boxClass: 'box-2', title: '名称待定', price: '¥ 200.00', desc: '介绍待定...' },
  { id: 'p3', boxClass: 'box-3', title: '名称待定', price: '¥ 500.00', desc: '介绍待定...' }
]

const openStore = () => {
  storeOpen.value = true
}

const closeStore = () => {
  storeOpen.value = false
}

const onProductClick = (id, event) => {
  if (event.target.closest('.toggle-btn') || event.target.classList.contains('toggle-dot')) {
    flippedProducts[id] = !flippedProducts[id]
  }
}
</script>

<style scoped>
#bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.5;
  pointer-events: none;
}

.left-return-dot {
  text-decoration: none;
}
</style>
