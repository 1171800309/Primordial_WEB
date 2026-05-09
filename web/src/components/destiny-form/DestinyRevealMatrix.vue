<template>
  <section class="mingge-matrix" :class="{ 'matrix--mobile': isMobile }">
    <div class="matrix-aurora" aria-hidden="true" />
    <div class="matrix-mist" aria-hidden="true" />
    <div class="matrix-stars" aria-hidden="true" />

    <div class="matrix-inner">
      <div class="matrix-block">
        <h2 class="matrix-ritual-title">命格推演法阵</h2>
        <p class="matrix-ritual-sub">天机显现 · 炁聚成形</p>
      </div>

      <!-- 四柱十字 -->
      <div class="matrix-block pillar-fate">
        <h3 class="matrix-block-title">四柱天机</h3>
        <div class="pillar-cross">
          <DestinyFieldNode
            class="pnc-year"
            title="天机·年宫"
            :value="form.yearPillar"
            variant="pillar"
            :ready="revealReady"
            :is-mobile="isMobile"
            :stagger="1"
          />
          <DestinyFieldNode
            class="pnc-month"
            title="月令·气场"
            :value="form.monthPillar"
            variant="pillar"
            :ready="revealReady"
            :is-mobile="isMobile"
            :stagger="2"
          />
          <DestinyFieldNode
            class="pnc-day"
            title="命主·本源"
            :value="form.dayPillar"
            variant="pillar"
            emphasize
            :ready="revealReady"
            :is-mobile="isMobile"
            :stagger="3"
          />
          <DestinyFieldNode
            class="pnc-hour"
            title="未来·因果"
            :value="form.hourPillar"
            variant="pillar"
            :ready="revealReady"
            :is-mobile="isMobile"
            :stagger="4"
          />
          <div class="pnc-taiji" aria-hidden="true">
            <span>☯</span>
          </div>
        </div>
      </div>

      <!-- 岁运 -->
      <div class="matrix-grid matrix-grid--3">
        <DestinyFieldNode title="大运·岁运" :value="form.majorLuckPillar" :ready="revealReady" :is-mobile="isMobile" :stagger="5" />
        <DestinyFieldNode title="流年·岁君" :value="form.flowYear" :ready="revealReady" :is-mobile="isMobile" :stagger="6" />
        <DestinyFieldNode title="流月·月建" :value="form.flowMonth" :ready="revealReady" :is-mobile="isMobile" :stagger="7" />
      </div>
      <DestinyFieldNode
        class="matrix-full"
        title="岁运·合辙"
        subtitle="流年 / 流月"
        :value="form.flowYearMonthPillar"
        :ready="revealReady"
        :is-mobile="isMobile"
        :stagger="8"
      />
      <DestinyFieldNode
        v-if="form.extraPillarText"
        class="matrix-full"
        title="天机余晖"
        subtitle="四柱干支扩展"
        :value="form.extraPillarText"
        multiline
        :ready="revealReady"
        :is-mobile="isMobile"
        :stagger="9"
      />

      <FiveElementsCore
        :bazi="bazi"
        :xi-yong="form.xiYongWuXingPort"
        :ji-shen="form.jiShenWuXingPort"
        :ready="revealReady"
        :is-mobile="isMobile"
        :stagger="10"
      />

      <div class="matrix-grid matrix-grid--3">
        <DestinyFieldNode title="气机·所养" subtitle="五行喜用" :value="form.usefulElement" :ready="revealReady" :is-mobile="isMobile" :stagger="11" />
        <DestinyFieldNode title="气机·所克" subtitle="五行忌用" :value="form.unfavorableElement" :ready="revealReady" :is-mobile="isMobile" :stagger="12" />
        <DestinyFieldNode title="日元·命主" :value="form.dayMaster" :ready="revealReady" :is-mobile="isMobile" :stagger="13" />
      </div>
      <div class="matrix-grid matrix-grid--3">
        <DestinyFieldNode title="天机所喜" subtitle="喜用神五行" :value="form.xiYongWuXingPort" variant="xi" :ready="revealReady" :is-mobile="isMobile" :stagger="14" />
        <DestinyFieldNode title="命格所忌" subtitle="忌用神五行" :value="form.jiShenWuXingPort" variant="ji" :ready="revealReady" :is-mobile="isMobile" :stagger="15" />
        <DestinyFieldNode title="命势四象" subtitle="得令·得地·得势·得生" :value="form.balanceAxesLine" multiline :ready="revealReady" :is-mobile="isMobile" :stagger="16" />
      </div>

      <div class="matrix-split">
        <BodyBalanceRitual
          :text="form.bodyStrengthSnippet"
          :composite="form.compositeJudgment"
          :ready="revealReady"
          :is-mobile="isMobile"
          :stagger="17"
        />
        <LifeCycleWheel :stage="form.twelveStage" :ready="revealReady" :is-mobile="isMobile" :stagger="18" />
      </div>

      <BirthCoordinateRitual :text="form.birthDirection" :ready="revealReady" :is-mobile="isMobile" :stagger="19" />

      <DestinyFieldNode
        class="matrix-full"
        title="命格定论"
        :value="form.compositeJudgment"
        variant="verdict"
        multiline
        :ready="revealReady"
        :is-mobile="isMobile"
        :stagger="20"
      />

      <div class="matrix-grid matrix-grid--2">
        <DestinyFieldNode title="机缘之神" subtitle="喜用十神" :value="form.usefulTenGods" :ready="revealReady" :is-mobile="isMobile" :stagger="21" />
        <DestinyFieldNode title="冲克之神" subtitle="忌用十神" :value="form.unfavorableTenGods" :ready="revealReady" :is-mobile="isMobile" :stagger="22" />
      </div>

      <DestinyFieldNode
        class="matrix-full"
        title="天干神煞"
        subtitle="天干十神之炁"
        :value="form.stemTenGodsDetail"
        multiline
        :ready="revealReady"
        :is-mobile="isMobile"
        :stagger="23"
      />

      <div class="matrix-grid matrix-grid--4">
        <DestinyFieldNode title="年命音律" :value="form.yearNaYin" variant="na" :ready="revealReady" :is-mobile="isMobile" :stagger="24" />
        <DestinyFieldNode title="月令音律" :value="form.monthNaYin" variant="na" :ready="revealReady" :is-mobile="isMobile" :stagger="25" />
        <DestinyFieldNode title="命核音律" :value="form.dayNaYin" variant="na" :ready="revealReady" :is-mobile="isMobile" :stagger="26" />
        <DestinyFieldNode title="因果音律" :value="form.hourNaYin" variant="na" :ready="revealReady" :is-mobile="isMobile" :stagger="27" />
      </div>

      <DestinyFieldNode
        v-if="form.extraNaYinText"
        class="matrix-full"
        title="纳音余韵"
        :value="form.extraNaYinText"
        multiline
        :ready="revealReady"
        :is-mobile="isMobile"
        :stagger="28"
      />
      <DestinyFieldNode
        v-if="form.tianGan12EnergyBlock"
        class="matrix-full"
        title="天干长生卷"
        subtitle="天干十二长生与能量"
        :value="form.tianGan12EnergyBlock"
        multiline
        :ready="revealReady"
        :is-mobile="isMobile"
        :stagger="29"
      />

      <HiddenStemRitual
        v-if="form.hiddenBranchesDetail"
        :json="form.hiddenBranchesDetail"
        :bazi="bazi"
        :ready="revealReady"
        :is-mobile="isMobile"
        :stagger="30"
      />

      <DestinyFieldNode
        class="matrix-full matrix-status"
        title="天机应验"
        :value="form.statusText"
        :ready="revealReady"
        :is-mobile="isMobile"
        :stagger="31"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import DestinyFieldNode from './DestinyFieldNode.vue'
import FiveElementsCore from './FiveElementsCore.vue'
import LifeCycleWheel from './LifeCycleWheel.vue'
import BodyBalanceRitual from './BodyBalanceRitual.vue'
import BirthCoordinateRitual from './BirthCoordinateRitual.vue'
import HiddenStemRitual from './HiddenStemRitual.vue'

const props = defineProps({
  form: { type: Object, required: true },
  bazi: { type: Object, default: null }
})

const revealReady = ref(false)
const isMobile = ref(false)
let mq = null

const applyMq = () => {
  if (!mq) return
  isMobile.value = mq.matches
}

const armReveal = () => {
  revealReady.value = false
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      revealReady.value = true
    }, 340)
  })
}

onMounted(() => {
  mq = window.matchMedia('(max-width: 767px)')
  applyMq()
  mq.addEventListener('change', applyMq)
  armReveal()
})

onUnmounted(() => {
  mq?.removeEventListener('change', applyMq)
})

watch(
  () => props.form,
  () => armReveal(),
  { deep: true }
)
</script>

<style scoped>
.mingge-matrix {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  padding: 8px 4px 16px;
}

.matrix-aurora {
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle at 50% 20%, rgba(200, 155, 60, 0.08), transparent 45%),
    radial-gradient(circle at 80% 70%, rgba(77, 163, 255, 0.06), transparent 40%);
  pointer-events: none;
  animation: mx-aura 14s ease-in-out infinite;
}

.matrix-mist {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(5, 5, 5, 0.25) 100%);
  pointer-events: none;
}

.matrix-stars {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(1px 1px at 10% 20%, rgba(255, 255, 255, 0.12), transparent),
    radial-gradient(1px 1px at 70% 40%, rgba(255, 255, 255, 0.08), transparent),
    radial-gradient(1px 1px at 30% 80%, rgba(255, 255, 255, 0.06), transparent);
  opacity: 0.35;
  pointer-events: none;
}

.matrix-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.matrix-ritual-title {
  margin: 0;
  text-align: center;
  font-size: clamp(15px, 3.6vw, 18px);
  font-weight: 600;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  background: linear-gradient(105deg, #e8d5a8, #c89b3c, #8b6b2e);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 12px rgba(200, 155, 60, 0.2));
}

.matrix-ritual-sub {
  margin: 8px 0 0;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.28em;
  text-indent: 0.28em;
  color: #6b7280;
}

.matrix-block-title {
  margin: 0 0 12px;
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.28em;
  text-indent: 0.28em;
  color: #9a9a8e;
}

.pillar-cross {
  display: grid;
  grid-template-columns: 1fr 1.15fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 10px;
  max-width: 520px;
  margin: 0 auto;
}

.pnc-year {
  grid-column: 2;
  grid-row: 1;
}

.pnc-month {
  grid-column: 1;
  grid-row: 2;
}

.pnc-day {
  grid-column: 2;
  grid-row: 2;
}

.pnc-hour {
  grid-column: 3;
  grid-row: 2;
}

.pnc-taiji {
  grid-column: 2;
  grid-row: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0 4px;
  font-size: clamp(26px, 7vw, 34px);
  color: rgba(200, 155, 60, 0.45);
  text-shadow: 0 0 20px rgba(200, 155, 60, 0.25);
  animation: taiji-float 6s ease-in-out infinite;
}

.matrix-grid {
  display: grid;
  gap: 10px;
}

.matrix-grid--2 {
  grid-template-columns: repeat(2, 1fr);
}

.matrix-grid--3 {
  grid-template-columns: repeat(3, 1fr);
}

.matrix-grid--4 {
  grid-template-columns: repeat(4, 1fr);
}

.matrix-full {
  width: 100%;
}

.matrix-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: stretch;
}

.matrix-status :deep(.node-title) {
  letter-spacing: 0.22em;
}

@media (max-width: 1023px) {
  .matrix-grid--4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .pillar-cross {
    display: flex;
    flex-direction: column;
    max-width: none;
  }

  .pnc-year {
    order: 1;
  }
  .pnc-month {
    order: 2;
  }
  .pnc-day {
    order: 3;
  }
  .pnc-hour {
    order: 4;
  }

  .pnc-taiji {
    order: 5;
    padding: 8px 0 4px;
  }

  .matrix-grid--3,
  .matrix-grid--2 {
    grid-template-columns: 1fr;
  }

  .matrix-split {
    grid-template-columns: 1fr;
  }

  .matrix-aurora {
    animation: none;
    opacity: 0.65;
  }

  .pnc-taiji {
    animation: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .matrix-aurora,
  .pnc-taiji {
    animation: none !important;
  }
}

@keyframes mx-aura {
  0%,
  100% {
    opacity: 0.75;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.03);
  }
}

@keyframes taiji-float {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.55;
  }
  50% {
    transform: translateY(-3px);
    opacity: 0.9;
  }
}
</style>
