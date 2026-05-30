<template>
  <div class="prototype-page auth-page">
    <div class="page-transition" :class="{ loaded }">
      <img :src="logoUrl" alt="一炁" class="transition-logo ink-blend" />
    </div>

    <canvas ref="canvasRef" id="auth-canvas" />

    <header class="auth-header">
      <router-link to="/" class="brand-container">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">
          <span class="zh">一炁文化</span>
          <span class="en">YI QI</span>
        </div>
      </router-link>
      <router-link v-if="headerLink" :to="headerLink.to" class="auth-nav-btn">
        {{ headerLink.label }}
      </router-link>
    </header>

    <main :class="['auth-main', { 'auth-main--scroll': scrollable }]">
      <img v-if="showHeroLogo" :src="logoUrl" alt="一炁" class="auth-hero-logo ink-blend" />
      <h1 v-if="title" class="auth-title">{{ title }}</h1>
      <p v-if="subtitle" class="auth-subtitle">{{ subtitle }}</p>

      <div :class="['auth-card', { 'auth-card--wide': wide }]">
        <slot />
      </div>

      <p v-if="footerNote" class="auth-footer-note">{{ footerNote }}</p>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import logoUrl from '@/assets/logo.png'
import { usePageTransition } from '@/composables/usePageTransition'
import { useOrbitCanvas } from '@/composables/useOrbitCanvas'
import '@/styles/prototype-base.css'
import '@/styles/pages/auth.css'

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  wide: { type: Boolean, default: false },
  scrollable: { type: Boolean, default: false },
  showHeroLogo: { type: Boolean, default: true },
  footerNote: { type: String, default: '仅供娱乐 · 文化探索与心理参考' },
  headerLink: {
    type: Object,
    default: () => ({ to: '/', label: '返回首页' })
  }
})

const canvasRef = ref(null)
const { loaded } = usePageTransition(800)
useOrbitCanvas(canvasRef)
</script>
