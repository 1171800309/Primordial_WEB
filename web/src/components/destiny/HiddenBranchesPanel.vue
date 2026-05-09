<template>
  <section v-if="branchKeys.length" class="block branch-block">
    <h3 class="block-title"><span class="title-glow">地支藏干十神之炁</span></h3>
    <p class="branch-hint">轻触各行展开藏干与十神（接口驱动 · 行光晕随地支本气五行）</p>
    <div class="branch-list">
      <button
        v-for="key in branchKeys"
        :key="key"
        type="button"
        class="branch-row"
        :class="rowClasses(key)"
        @click="toggle(key)"
      >
        <span class="branch-glow" aria-hidden="true" />
        <span class="branch-key">{{ key }}</span>
        <span class="branch-preview">{{ preview(key) }}</span>
        <span class="branch-chev" :class="{ open: expandedKey === key }">{{ expandedKey === key ? '▲' : '▼' }}</span>
      </button>

      <Transition name="expand">
        <div v-if="expandedKey" class="branch-detail-shell" :key="expandedKey">
          <div class="branch-detail">
            <div v-if="detailBlocks.length" class="cang-stack">
              <div v-for="(blk, bi) in detailBlocks" :key="bi" class="cang-block">
                <template v-if="blk.type === 'chips'">
                  <p v-if="blk.label" class="cang-block-title">{{ blk.label }}</p>
                  <div class="cang-chip-grid">
                    <div
                      v-for="(row, ri) in blk.rows"
                      :key="ri"
                      class="cang-chip"
                      :class="chipWxClass(row)"
                    >
                      <span class="cgan-stem">{{ row.stem }}</span>
                      <span class="cgan-meta">
                        <span v-if="row.god" class="cgan-god">{{ row.god }}</span>
                        <span v-if="row.wx" class="cgan-wx">{{ row.wx }}</span>
                      </span>
                    </div>
                  </div>
                </template>
                <template v-else-if="blk.type === 'kv'">
                  <div v-for="([kk, vv], ki) in blk.entries" :key="ki" class="kv-line">
                    <span class="kv-k">{{ kk }}</span>
                    <span class="kv-v">{{ formatLeaf(vv) }}</span>
                  </div>
                </template>
              </div>
            </div>
            <pre v-else class="branch-json">{{ plainDetail }}</pre>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  getBranchRowAuraWuXing,
  getTenGodChipClass,
  TIAN_GAN_WUXING
} from '@/utils/destinyModel'

const props = defineProps({
  data: { type: Object, default: null },
  /** 用于行光晕：按年支/日支等对应四柱取地支本气五行 */
  bazi: { type: Object, default: null }
})

const expandedKey = ref('')

const branchKeys = computed(() => {
  const o = props.data
  if (!o || typeof o !== 'object') return []
  return Object.keys(o)
})

const toggle = (key) => {
  expandedKey.value = expandedKey.value === key ? '' : key
}

const preview = (key) => {
  const v = props.data?.[key]
  if (v == null) return '—'
  if (typeof v === 'string') return v.length > 18 ? `${v.slice(0, 18)}…` : v
  if (Array.isArray(v)) return `${v.length} 项藏干`
  if (typeof v === 'object') return '藏干对象 · 点开展开'
  return String(v)
}

const rawDetail = computed(() => {
  const k = expandedKey.value
  if (!k) return null
  return props.data?.[k]
})

const plainDetail = computed(() => {
  const v = rawDetail.value
  if (v == null) return ''
  try {
    return typeof v === 'string' ? v : JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
})

const pick = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return ''
  for (const k of keys) {
    const x = obj[k]
    if (x != null && x !== '') return typeof x === 'object' ? '' : String(x)
  }
  return ''
}

const rowToChip = (row) => {
  if (row == null || typeof row !== 'object') return null
  const stem =
    pick(row, ['天干', '干', 'tianGan', 'gan']) ||
    (typeof row.干 === 'string' ? row.干 : '')
  const god = pick(row, ['十神', '神', 'shiShen', 'god'])
  const wx = pick(row, ['五行', '五行属性', 'wx']) || (stem ? TIAN_GAN_WUXING[stem] : '')
  if (!stem && !god && !wx) return null
  return { stem: stem || '—', god, wx }
}

const normalizeToBlocks = (v) => {
  if (v == null) return []
  if (typeof v === 'string') return []
  if (Array.isArray(v)) {
    const rows = v.map(rowToChip).filter(Boolean)
    if (rows.length) return [{ type: 'chips', label: '', rows }]
    return []
  }
  if (typeof v === 'object') {
    const blocks = []
    for (const [label, val] of Object.entries(v)) {
      if (Array.isArray(val)) {
        const rows = val.map(rowToChip).filter(Boolean)
        if (rows.length) blocks.push({ type: 'chips', label, rows })
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        const inner = Object.entries(val).map(([kk, vv]) => [kk, vv])
        if (inner.length) blocks.push({ type: 'kv', entries: inner })
      }
    }
    if (blocks.length) return blocks
    const flat = Object.entries(v)
    if (flat.length) return [{ type: 'kv', entries: flat }]
  }
  return []
}

const detailBlocks = computed(() => normalizeToBlocks(rawDetail.value))

const formatLeaf = (vv) => {
  if (vv == null) return ''
  if (typeof vv === 'string' || typeof vv === 'number' || typeof vv === 'boolean') return String(vv)
  try {
    return JSON.stringify(vv)
  } catch {
    return ''
  }
}

const chipWxClass = (row) => {
  const wx = row.wx
  const g = getTenGodChipClass(row.god)
  return [wx ? `chip-wx--${wx}` : null, g].filter(Boolean)
}

const rowClasses = (key) => {
  const aura = getBranchRowAuraWuXing(props.bazi, key)
  return {
    expanded: expandedKey.value === key,
    'is-day': key === '日支',
    [`aura--${aura}`]: Boolean(aura)
  }
}
</script>

<style scoped>
.block {
  margin-bottom: 28px;
}

.block-title {
  margin: 0 0 10px;
  font-size: clamp(12px, 2.8vw, 13px);
  font-weight: 500;
  letter-spacing: 0.28em;
  color: #9a9a8e;
}

.title-glow {
  color: #c9b896;
  text-shadow: 0 0 12px rgba(200, 155, 60, 0.2);
}

.branch-hint {
  margin: 0 0 12px;
  font-size: 11px;
  color: #6b7280;
  letter-spacing: 0.08em;
}

.branch-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.branch-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(200, 155, 60, 0.15);
  background: rgba(5, 5, 5, 0.35);
  color: #e8e4dc;
  font: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  overflow: hidden;
  transition:
    border-color 0.28s ease,
    transform 0.2s ease,
    box-shadow 0.28s ease;
}

.branch-row:active {
  transform: scale(0.99);
}

.branch-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
  background: radial-gradient(
    ellipse 120% 80% at 0% 50%,
    color-mix(in srgb, var(--aura-color, transparent) 28%, transparent),
    transparent 62%
  );
}

.branch-row.is-day {
  border-color: rgba(200, 155, 60, 0.35);
}

.branch-row.expanded {
  border-color: rgba(77, 163, 255, 0.35);
  box-shadow: 0 0 0 1px rgba(77, 163, 255, 0.12) inset;
}

.branch-row.expanded .branch-glow {
  opacity: 1;
}

.branch-row.aura--金 {
  --aura-color: #c89b3c;
}
.branch-row.aura--木 {
  --aura-color: #4faf6c;
}
.branch-row.aura--水 {
  --aura-color: #4da3ff;
}
.branch-row.aura--火 {
  --aura-color: #ff6b4a;
}
.branch-row.aura--土 {
  --aura-color: #9a7b5c;
}

.branch-row.aura--金 .branch-glow,
.branch-row.aura--木 .branch-glow,
.branch-row.aura--水 .branch-glow,
.branch-row.aura--火 .branch-glow,
.branch-row.aura--土 .branch-glow {
  opacity: 0.55;
}

.branch-row.expanded .branch-glow {
  animation: cang-breathe 2.8s ease-in-out infinite;
}

@keyframes cang-breathe {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 0.95;
  }
}

.branch-key {
  flex: 0 0 auto;
  font-size: 13px;
  color: #c9b896;
  letter-spacing: 0.12em;
}

.branch-preview {
  flex: 1;
  font-size: 12px;
  color: #9a9a8e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.branch-chev {
  flex: 0 0 auto;
  font-size: 10px;
  color: #6b7280;
  transition: transform 0.3s ease;
}

.branch-chev.open {
  transform: rotate(-180deg);
}

.branch-detail-shell {
  overflow: hidden;
}

.branch-detail {
  margin-top: 6px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(5, 5, 5, 0.55);
  border: 1px solid rgba(200, 155, 60, 0.12);
  backdrop-filter: blur(8px);
}

.cang-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cang-block-title {
  margin: 0 0 8px;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: #9a9a8e;
}

.cang-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cang-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 56px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(200, 155, 60, 0.18);
  background: rgba(11, 28, 44, 0.45);
  animation: chip-in 0.45s ease-out both;
}

.cang-chip:nth-child(1) {
  animation-delay: 0.04s;
}
.cang-chip:nth-child(2) {
  animation-delay: 0.1s;
}
.cang-chip:nth-child(3) {
  animation-delay: 0.16s;
}

@keyframes chip-in {
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.cgan-stem {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: #f0e6d4;
}

.cgan-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  color: #9a9a8e;
}

.cgan-god {
  letter-spacing: 0.06em;
}

.cgan-wx {
  opacity: 0.85;
}

.chip-wx--金 {
  border-color: rgba(200, 155, 60, 0.45);
  box-shadow: 0 0 14px rgba(200, 155, 60, 0.12);
}
.chip-wx--木 {
  border-color: rgba(79, 175, 108, 0.4);
  box-shadow: 0 0 14px rgba(79, 175, 108, 0.1);
}
.chip-wx--水 {
  border-color: rgba(77, 163, 255, 0.4);
  box-shadow: 0 0 14px rgba(77, 163, 255, 0.1);
}
.chip-wx--火 {
  border-color: rgba(255, 107, 74, 0.45);
  box-shadow: 0 0 14px rgba(255, 107, 74, 0.1);
}
.chip-wx--土 {
  border-color: rgba(154, 123, 92, 0.45);
  box-shadow: 0 0 14px rgba(154, 123, 92, 0.1);
}

.cang-chip.god-kill {
  border-color: rgba(255, 107, 74, 0.28);
  box-shadow: 0 0 12px rgba(255, 107, 74, 0.08);
}

.cang-chip.god-official {
  border-color: rgba(77, 163, 255, 0.28);
}

.cang-chip.god-seal {
  border-color: rgba(200, 155, 60, 0.32);
}

.cang-chip.god-rob {
  border-color: rgba(200, 155, 60, 0.2);
  animation: rob-nudge 4s ease-in-out infinite;
}

.cang-chip.god-output {
  border-color: rgba(79, 175, 108, 0.28);
}

.cang-chip.god-wealth {
  border-color: rgba(200, 155, 60, 0.35);
}

.cang-chip.god-default {
  border-color: rgba(255, 255, 255, 0.08);
}

@keyframes rob-nudge {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(1px);
  }
}

.kv-line {
  display: flex;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(200, 155, 60, 0.08);
  font-size: 12px;
}

.kv-line:last-child {
  border-bottom: none;
}

.kv-k {
  flex: 0 0 5em;
  color: #9a9a8e;
  letter-spacing: 0.08em;
}

.kv-v {
  flex: 1;
  color: #d4cfc4;
  word-break: break-word;
}

.branch-json {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: #c9c4b8;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
  max-width: 100%;
}

.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.32s ease,
    max-height 0.38s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: min(1200px, 85vh);
}

@media (max-width: 767px) {
  .branch-detail {
    backdrop-filter: blur(5px);
    padding: 10px;
  }

  .branch-row.expanded .branch-glow {
    animation: none;
    opacity: 0.65;
  }

  .cang-chip {
    min-width: 52px;
    padding: 9px 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .branch-row.expanded .branch-glow,
  .cang-chip,
  .branch-chev,
  .cang-chip.god-rob {
    animation: none !important;
    transition: none !important;
  }

  .expand-enter-active,
  .expand-leave-active {
    transition: opacity 0.2s ease;
  }
}
</style>
