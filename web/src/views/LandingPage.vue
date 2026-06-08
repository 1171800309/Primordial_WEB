<template>
  <div class="prototype-page landing-page">
    <canvas ref="nebulaRef" id="global-nebula" />

    <header>
      <router-link to="/" class="brand-container">
        <img :src="logoUrl" alt="一炁" class="real-logo ink-blend" />
        <div class="brand-text">
          <span class="zh">一炁文化</span>
          <span class="en">YI QI</span>
        </div>
      </router-link>
      <router-link to="/login" class="nav-btn">登录</router-link>
    </header>

    <section id="screen-1" class="section-transparent">
      <img :src="logoUrl" alt="一炁" class="hero-logo reveal ink-blend" :class="{ active: revealed }" />
      <h1 class="title-huge reveal delay-1" :class="{ active: revealed }">由炁始，逆熵求己</h1>
      <div class="text-body reveal delay-2" :class="{ active: revealed }">
        人先天得炁而生，顺熵失炁则"亡"，宇宙万物皆有炁，炁有其数，炁有其性。<br />
        观己之炁，察万物炁，运己之炁，顺万物炁之势，逆己炁之熵。
      </div>
    </section>

    <section id="screen-2" class="section-solid">
      <div class="split-layout">
        <div class="canvas-container-gas reveal" :class="{ active: revealed }">
          <canvas ref="gasRef" />
        </div>
        <div class="reveal delay-1" :class="{ active: revealed }">
          <h2 class="title-huge" style="margin-bottom: 30px">炁</h2>
          <div class="text-body">
            读作 <span class="highlight-gold">qì</span>。<br />
            它是你与生俱来的"出厂能量电池"。<br /><br />
            为什么有时你充满干劲，有时却莫名内耗？<br />
            为什么换了个环境，突然觉得诸事顺遂、心情大好？<br /><br />
            这些看不见、摸不着，却真实影响你情绪起伏、状态好坏的底层磁场，<br />
            被称为「炁」。<br />
            它不是玄学，而是你在这个宇宙中专属的频率。
          </div>
        </div>
      </div>
    </section>

    <section id="screen-3" class="section-solid">
      <div class="states-container">
        <div class="state-box reveal" :class="{ active: revealed }">
          <div class="state-canvas-wrap"><canvas ref="nourishRef" /></div>
          <div class="state-label">滋养</div>
          <div style="font-size: 13px; color: var(--text-dark)">外部环境大炁场滋养"你"</div>
        </div>
        <div class="state-box reveal delay-1" :class="{ active: revealed }">
          <div class="state-canvas-wrap"><canvas ref="suppressRef" /></div>
          <div class="state-label">压制</div>
          <div style="font-size: 13px; color: var(--text-dark)">外部环境压制"你"</div>
        </div>
        <div class="state-box reveal delay-2" :class="{ active: revealed }">
          <div class="state-canvas-wrap"><canvas ref="clashRef" /></div>
          <div class="state-label">混战</div>
          <div style="font-size: 13px; color: var(--text-dark)">外部环境与"你"互相混战</div>
        </div>
      </div>
      <div class="screen-3-text reveal" :class="{ active: revealed }">
        为什么有些关系总是无底线地消耗你？<br />
        不是性格不合，是底层磁场的错位。<br /><br />
        在「一炁」，没有吉凶，只有周期。没有相克，只有碰撞。<br />
        「炁」并不决定你明天会赚多少钱，而是决定了当你遇到危机时——<br />
        你的能量特质是更适合<span class="highlight-gold">化身为山去沉淀</span>，还是<span class="highlight-gold">汇聚成海去顺流</span>。<br />
        理解了你的炁，你就理解了自己为何做出那些选择。
      </div>
    </section>

    <section id="screen-4" class="section-solid">
      <div class="section-header reveal" :class="{ active: revealed }">
        <h2 class="title-huge">逆熵求己的第一步，<br />是先了解自己。</h2>
      </div>
      <div class="grid-12">
        <div v-for="card in traitCards" :key="card.title" class="card-mini reveal" :class="{ active: revealed }">
          <LandingTraitIcon :name="card.icon" />
          <h4>{{ card.title }}</h4>
          <p>{{ card.desc }}</p>
        </div>
      </div>
    </section>

    <section id="screen-5" class="section-solid">
      <div class="section-header reveal" :class="{ active: revealed }">
        <h2 class="title-huge">若能清楚明确时空维度下<br />"炁"的基调，便可顺势而为。</h2>
      </div>
      <div class="grid-2">
        <div class="card-large reveal" :class="{ active: revealed }">
          <div class="abstract-icon" />
          <h3 style="font-family: var(--font-serif); font-size: 24px; font-weight: 300">大运·变·炁场</h3>
          <p class="text-body">"这十年，我被什么样的能量包裹着？<br />外部的环境是什么基调？内部的推力是什么方向？"</p>
        </div>
        <div class="card-large reveal delay-1" :class="{ active: revealed }">
          <div class="abstract-icon" style="animation-direction: reverse; border-style: dotted" />
          <h3 style="font-family: var(--font-serif); font-size: 24px; font-weight: 300">流年·变·炁场</h3>
          <p class="text-body">"这一年，舞台上在演什么戏？<br />幕后什么力量在推动？"</p>
        </div>
      </div>
    </section>

    <section id="screen-6" class="section-solid">
      <div class="store-box reveal" :class="{ active: revealed }">
        <h2 class="title-huge" style="margin-bottom: 24px">万炁之城</h2>
        <p class="text-body">世间万物皆有其炁，我们收集了很多有意思的"炁物"。<br />欢迎探索。</p>
      </div>
      <div class="store-note reveal delay-1" :class="{ active: revealed }">不仅止于此，更多深度内容期待你的探索。</div>
    </section>

    <section id="screen-7" class="section-transparent">
      <h2 class="title-huge reveal" :class="{ active: revealed }" style="text-align: center">探索指南</h2>
      <div class="faq-container">
        <div v-for="(faq, i) in faqs" :key="faq.q" class="faq-item reveal" :class="{ active: revealed, 'delay-1': i % 2 === 1 }">
          <div class="faq-q">{{ faq.q }}</div>
          <div class="faq-a">{{ faq.a }}</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 100px" class="reveal" :class="{ active: revealed }">
        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.2); letter-spacing: 0.2em">© YI QI. 逆熵求己，方为大道。</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import logoUrl from '@/assets/logo.png'
import LandingTraitIcon from '@/components/landing/LandingTraitIcon.vue'
import '@/styles/prototype-base.css'
import '@/styles/pages/首页.css'

const nebulaRef = ref(null)
const gasRef = ref(null)
const nourishRef = ref(null)
const suppressRef = ref(null)
const clashRef = ref(null)
const revealed = ref(false)
let raf = 0
let glParticles = []
let glW = 0
let glH = 0

const traitCards = [
  { icon: 'book', title: '先天特性', desc: '生命底层的"源代码"，不因环境改变。你扮演无数角色，但核心的"性"早已写定。' },
  { icon: 'arrow', title: '先天行为特性', desc: '与生俱来的"行动方式"——不是你要做什么，而是无论做什么都改不掉的"做法"。' },
  { icon: 'sun', title: '先天天赋特性', desc: '"我的能量在先天环境中被激发出了什么天赋？"' },
  { icon: 'cross', title: '先天气质特性', desc: '"我带着怎样的气质？"' },
  { icon: 'square', title: '先天性格底色特性', desc: '"我的能量被先天环境塑造出了什么性格底色？"' },
  { icon: 'wave', title: '先天社会人格特性', desc: '"我与社会的关系模式"——你带着什么样的社会人格，面对什么样的社会期待。' },
  { icon: 'heart', title: '先天情感特性', desc: '"我在最亲密的关系里是什么样子？"' },
  { icon: 'clock', title: '先天潜在驱动力', desc: '"我内心深处最渴望什么、最被什么推动。"' },
  { icon: 'peak', title: '先天终极倾向', desc: '与生俱来的终极倾向——"我这一生，最终要走向哪里？"' },
  { icon: 'star', title: '先天深层原始冲动', desc: '"我在极端情境下才会被激活的原始本能"。' },
  { icon: 'eye', title: '先天隐藏特性', desc: '"我内心深处藏着但自己未必知道的才能"。' }
]

const faqs = [
  { q: 'Q1：「一炁」和市面上的算命软件有什么区别？', a: '我们不占卜，不恐吓，不卖转运物。传统算命试图告诉你"明天会发生什么"，这是一种宿命的束缚；而「一炁」结合东方哲学与心理学，只让你看见"你本来的能量结构是怎样的"。我们不是预言机，我们是一面映照你底层磁场的镜子。' },
  { q: 'Q2：你们真的能算出我的「命运」吗？', a: '命运不是一句写死的判词，而是"你的底层性格 × 你做出的选择 × 外部时间周期"。我们无法算出你会遇见谁、赚多少钱，但通过观测你的「先天炁性」，我们能告诉你，为何你总是被某一类人吸引，为何在某个阶段感到严重内耗。' },
  { q: 'Q3：输入我的真实出生时间，隐私安全吗？', a: '极致安全。你的时间数据仅用于瞬间的"时空参数对齐"与"能量场生成"。系统采用非对称加密处理，阅后即焚，绝不留存。在「一炁」，我们只凝视时空的规律，绝不窥探个人的隐私。' },
  { q: 'Q4：我应该如何正确看待生成的分析结果？', a: '请把它当成一次"向内的自我冥想"，而不是"不容置疑的圣旨"。当你顺遂时，用它印证你的天赋；当你低谷时，用它接纳自己的能量周期。所有结果仅作文化探索与心理参考。请永远记住：命虽天定，炁由我造。' }
]

const setupCanvas = (canvasRef) => {
  const cvs = canvasRef.value
  if (!cvs?.parentElement) return null
  const ctx = cvs.getContext('2d')
  const rect = cvs.parentElement.getBoundingClientRect()
  cvs.width = rect.width
  cvs.height = rect.height
  return { cvs, ctx, w: rect.width, h: rect.height }
}

let gas = null
let gasParticles = []
let nsh = null
let nshP = []
let sup = null
let supP = []
let cls = null
let clsP = []

const initCanvases = () => {
  glW = window.innerWidth
  glH = window.innerHeight
  if (nebulaRef.value) {
    nebulaRef.value.width = glW
    nebulaRef.value.height = glH
  }
  glParticles = Array.from({ length: 300 }, () => ({
    r: Math.random() * (glW > 800 ? 600 : 300) + 20,
    a: Math.random() * Math.PI * 2,
    s: (Math.random() > 0.5 ? 1 : -1) * (0.0001 + Math.random() * 0.0002),
    size: Math.random() * 1.5,
    color: Math.random() > 0.7 ? 'rgba(234,222,199,0.3)' : 'rgba(255,255,255,0.2)',
    w: Math.random() * Math.PI * 2
  }))

  gas = setupCanvas(gasRef)
  if (gas) {
    gasParticles = Array.from({ length: 150 }, () => ({
      x: Math.random() * gas.w, y: Math.random() * gas.h,
      vx: (Math.random() - 0.5), vy: (Math.random() - 0.5),
      size: Math.random() * 2 + 0.5, alpha: Math.random() * 0.5 + 0.1
    }))
  }

  nsh = setupCanvas(nourishRef)
  if (nsh) nshP = Array.from({ length: 60 }, () => ({ x: Math.random() * nsh.w, y: nsh.h + Math.random() * 50, s: Math.random() + 0.5 }))

  sup = setupCanvas(suppressRef)
  if (sup) supP = Array.from({ length: 80 }, () => ({ x: Math.random() * sup.w, y: -Math.random() * sup.h, v: Math.random() * 2 + 1 }))

  cls = setupCanvas(clashRef)
  if (cls) clsP = Array.from({ length: 50 }, () => ({ x: cls.w / 2, y: cls.h / 2, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4 }))
}

const drawAll = () => {
  const glCtx = nebulaRef.value?.getContext('2d')
  if (glCtx) {
    glCtx.clearRect(0, 0, glW, glH)
    const grad = glCtx.createRadialGradient(glW / 2, glH / 2, 0, glW / 2, glH / 2, glH)
    grad.addColorStop(0, 'rgba(234, 222, 199, 0.05)')
    grad.addColorStop(1, 'transparent')
    glCtx.fillStyle = grad
    glCtx.fillRect(0, 0, glW, glH)
    glParticles.forEach((p) => {
      p.a += p.s
      p.w += 0.01
      const r = p.r + Math.sin(p.w) * 10
      const x = glW / 2 + Math.cos(p.a) * r
      const y = glH / 2 + Math.sin(p.a) * r * 0.7
      glCtx.beginPath()
      glCtx.arc(x, y, p.size, 0, Math.PI * 2)
      glCtx.fillStyle = p.color
      glCtx.fill()
    })
  }

  if (gas?.ctx) {
    gas.ctx.fillStyle = 'rgba(5,5,7,0.1)'
    gas.ctx.fillRect(0, 0, gas.w, gas.h)
    gasParticles.forEach((p) => {
      p.vx += (Math.random() - 0.5) * 0.2
      p.vy += (Math.random() - 0.5) * 0.2
      p.vx *= 0.98
      p.vy *= 0.98
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = gas.w
      if (p.x > gas.w) p.x = 0
      if (p.y < 0) p.y = gas.h
      if (p.y > gas.h) p.y = 0
      gas.ctx.beginPath()
      gas.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      gas.ctx.fillStyle = `rgba(234,222,199,${p.alpha})`
      gas.ctx.fill()
    })
  }

  if (nsh?.ctx) {
    nsh.ctx.fillStyle = 'rgba(3,3,4,0.2)'
    nsh.ctx.fillRect(0, 0, nsh.w, nsh.h)
    nsh.ctx.beginPath()
    nsh.ctx.arc(nsh.w / 2, nsh.h / 2, 20, 0, Math.PI * 2)
    nsh.ctx.fillStyle = 'rgba(234,222,199,0.1)'
    nsh.ctx.fill()
    nshP.forEach((p) => {
      p.y -= p.s
      p.x += (nsh.w / 2 - p.x) * 0.01
      if (p.y < nsh.h / 2 - 20) {
        p.y = nsh.h + 10
        p.x = Math.random() * nsh.w
      }
      nsh.ctx.beginPath()
      nsh.ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
      nsh.ctx.fillStyle = 'rgba(234,222,199,0.8)'
      nsh.ctx.fill()
    })
  }

  if (sup?.ctx) {
    sup.ctx.fillStyle = 'rgba(3,3,4,0.2)'
    sup.ctx.fillRect(0, 0, sup.w, sup.h)
    sup.ctx.beginPath()
    sup.ctx.arc(sup.w / 2, sup.h - 30, 15, 0, Math.PI * 2)
    sup.ctx.fillStyle = 'rgba(255,255,255,0.2)'
    sup.ctx.fill()
    supP.forEach((p) => {
      p.y += p.v
      if (p.y > sup.h - 30) {
        p.y = -10
        p.x = Math.random() * sup.w
      }
      sup.ctx.fillStyle = 'rgba(255,255,255,0.4)'
      sup.ctx.fillRect(p.x, p.y, 1, 8)
    })
  }

  if (cls?.ctx) {
    cls.ctx.fillStyle = 'rgba(3,3,4,0.3)'
    cls.ctx.fillRect(0, 0, cls.w, cls.h)
    clsP.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > cls.w) p.vx *= -1
      if (p.y < 0 || p.y > cls.h) p.vy *= -1
      cls.ctx.beginPath()
      cls.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
      cls.ctx.fillStyle = Math.random() > 0.5 ? 'rgba(234,222,199,0.8)' : 'rgba(255,255,255,0.5)'
      cls.ctx.fill()
    })
  }

  raf = requestAnimationFrame(drawAll)
}

onMounted(() => {
  revealed.value = true
  initCanvases()
  raf = requestAnimationFrame(drawAll)
  window.addEventListener('resize', initCanvases)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', initCanvases)
})
</script>

<style scoped>
.landing-page .reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 1.2s var(--bezier-smooth), transform 1.2s var(--bezier-smooth);
}
.landing-page .reveal.active {
  opacity: 1;
  transform: translateY(0);
}
.landing-page .reveal.delay-1.active { transition-delay: 0.15s; }
.landing-page .reveal.delay-2.active { transition-delay: 0.3s; }
.icon-placeholder {
  width: 24px;
  height: 24px;
  border: 1px solid var(--gold-light);
  border-radius: 4px;
  opacity: 0.6;
}
</style>
