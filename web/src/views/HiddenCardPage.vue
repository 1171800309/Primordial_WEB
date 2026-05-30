<template>
  <div class="prototype-page hidden-card-page">
    <canvas ref="canvasRef" id="bg-canvas" />
    <div class="holy-glow" />

    <div id="discovery-modal" :class="{ hidden: modalHidden }">
      <div class="modal-box">
        <div class="modal-ring" />
        <div class="modal-title">机缘触发</div>
        <div class="modal-desc">
          系统在你的深层能量场中，侦测到未知的炁场剧烈波动...<br />你已解锁极少数人具备的
          <span>「隐藏词卡」</span>
        </div>
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

      <div class="ur-cards-container">
        <div v-for="card in urCards" :key="card.id" class="ur-card-wrapper">
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
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import logoUrl from '@/assets/logo.png'
import { useDustCanvas } from '@/composables/useDustCanvas'
import '@/styles/prototype-base.css'
import '@/styles/pages/隐藏词卡.css'

const canvasRef = ref(null)
useDustCanvas(canvasRef)

const modalHidden = ref(false)
const contentRevealed = ref(false)

const urCards = [
  {
    id: 'ur1',
    label: '深层原始冲动特性',
    cover: '“我在极端情境下<br>才会被激活的原始本能”',
    yang: {
      title: '修罗',
      annotation: '撕裂常规的毁灭与重塑之力。',
      desc: '在绝境与极度高压下，常规道德与理性会被瞬间剥离，爆发出纯粹的生存与反击本能。'
    },
    yin: {
      desc: '一旦开启，极其容易带来不可逆的破坏，甚至在狂热中反噬自身曾经最珍视的羁绊与事物。'
    }
  },
  {
    id: 'ur2',
    label: '隐藏能力特性',
    cover: '“我内心深处藏着<br>但自己未必知道的才能”',
    yang: {
      title: '虚空造物',
      annotation: '无中生有的直觉构筑力。',
      desc: '能够从绝对的无序和混乱中，瞬间抓取核心规律，凭直觉搭建出全新的规则或系统。'
    },
    yin: {
      desc: '过于超前与跳跃的思维内核，常使得在世俗沟通中显得极其孤僻与傲慢，难以被同频理解。'
    }
  }
]

const cardStates = reactive(
  Object.fromEntries(urCards.map((c) => [c.id, { opened: false, yin: false }]))
)

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
