/**
 * 命盘天机 · 接口动态渲染（与后端 Destiny / baziAnalysis 中文键一致）
 * 对齐《命盘天机接口动态渲染规范》
 */

export const WUXING_ORDER = ['金', '木', '水', '火', '土']

export const WUXING_COLORS = {
  金: '#c89b3c',
  木: '#4faf6c',
  水: '#4da3ff',
  火: '#ff6b4a',
  土: '#9a7b5c'
}

export const PILLAR_KEY_ORDER = ['年柱', '月柱', '日柱', '时柱']

export const TWELVE_STAGES = [
  '长生',
  '沐浴',
  '冠带',
  '临官',
  '帝旺',
  '衰',
  '病',
  '死',
  '墓',
  '绝',
  '胎',
  '养'
]

/** 十二长生阶段 → CSS 特效类（禁止所有状态同一效果） */
export const TWELVE_STAGE_EFFECT_CLASS = {
  帝旺: 'effect-emperor',
  临官: 'effect-emperor',
  冠带: 'effect-rise',
  长生: 'effect-rise',
  墓: 'effect-tomb',
  绝: 'effect-death',
  死: 'effect-death',
  病: 'effect-weak',
  衰: 'effect-weak',
  胎: 'effect-seed',
  养: 'effect-seed',
  沐浴: 'effect-flow'
}

export const getTwelveStageEffectClass = (stage) => {
  const s = String(stage || '').trim()
  return TWELVE_STAGE_EFFECT_CLASS[s] || 'effect-default'
}

/** 综合判定 → 阴阳仪基调 */
export const getBalanceMoodClass = (composite) => {
  const s = String(composite || '')
  if (s.includes('偏强') || s.includes('身强') || s.includes('从强')) return 'mood-strong'
  if (s.includes('偏弱') || s.includes('身弱') || s.includes('从弱')) return 'mood-weak'
  if (s.includes('中和') || s.includes('平衡')) return 'mood-neutral'
  return 'mood-neutral'
}

const formatPillarCell = (item) => {
  if (item == null) return ''
  if (typeof item === 'string') return item.trim()
  if (typeof item === 'object') {
    const a = item.tianGan || item.天干 || ''
    const b = item.diZhi || item.地支 || ''
    return `${a}${b}`.trim()
  }
  return ''
}

/**
 * 四柱干支：严格按接口键动态生成列表（v-for 数据源，禁止写死四柱文案）
 * @returns {{ key: string, label: string, text: string }[]}
 */
export const getPillarEntries = (bz) => {
  if (!bz || typeof bz !== 'object') return []
  const p = bz['四柱干支']
  if (!p || typeof p !== 'object') return []
  return PILLAR_KEY_ORDER.map((key) => ({
    key,
    label: key,
    text: formatPillarCell(p[key])
  }))
}

/** @param {Record<string, unknown>|null|string|undefined} bz */
export const parseBirthDirection = (bz) => {
  if (!bz || typeof bz !== 'object') return ''
  const v = bz['出生方位']
  return typeof v === 'string' ? v.trim() : ''
}

/** @param {Record<string, unknown>|null|string|undefined} bz */
export const parseFiveElementsTotal = (bz) => {
  const empty = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
  if (!bz || typeof bz !== 'object') return { ...empty, colors: WUXING_COLORS, order: WUXING_ORDER }
  const raw = bz['五行能量合计'] || bz['五行能量'] || {}
  if (typeof raw !== 'object' || raw === null) return { ...empty, colors: WUXING_COLORS, order: WUXING_ORDER }
  const out = { ...empty }
  for (const k of WUXING_ORDER) {
    const v = raw[k]
    out[k] = typeof v === 'number' && !Number.isNaN(v) ? v : Number(v) || 0
  }
  return { ...out, colors: WUXING_COLORS, order: WUXING_ORDER }
}

/** 用于光强/粒子：value / max ，max 为五行中最大或规范中的 50 */
export const getWuxingIntensities = (totals) => {
  const order = WUXING_ORDER
  const vals = order.map((k) => Math.max(0, Number(totals[k]) || 0))
  const max = Math.max(...vals, 1)
  const ref = 50
  const normMax = Math.max(max, ref)
  const out = {}
  order.forEach((k, i) => {
    out[k] = Math.min(1, vals[i] / normMax)
  })
  return { intensities: out, max: normMax }
}

/** 某行强度对应的粒子数量（移动端由组件传入 isMobile 再乘系数） */
export const getParticleCountForElement = (intensity, isMobile) => {
  const base = Math.round(intensity * (isMobile ? 40 : 120))
  return Math.min(isMobile ? 40 : 120, Math.max(0, base))
}

/** @param {Record<string, unknown>|null|string|undefined} bz */
export const parseTwelveStage = (bz) => {
  if (!bz || typeof bz !== 'object') return ''
  if (typeof bz['十二长生'] === 'string') return bz['十二长生'].trim()
  const tg = bz['天干十二长生与能量']
  if (typeof tg === 'string') return tg.trim()
  if (tg && typeof tg === 'object') {
    const v = tg['十二长生'] ?? tg['阶段'] ?? tg['长生']
    if (typeof v === 'string') return v.trim()
  }
  return ''
}

/** 综合判定（接口顶层字符串） */
export const parseCompositeJudgment = (bz) => {
  if (!bz || typeof bz !== 'object') return ''
  const a = bz['综合判定']
  if (typeof a === 'string' && a.trim()) return a.trim()
  return ''
}

/** 身旺身弱：可能是 object，用于展示副文案或天平旁注 */
export const parseBodyStrengthSnippet = (bz) => {
  if (!bz || typeof bz !== 'object') return ''
  const o = bz['身旺身弱']
  if (typeof o === 'string') return o.trim()
  if (o && typeof o === 'object') {
    const t = o['判定'] ?? o['结论'] ?? o['概要']
    if (typeof t === 'string' && t.trim()) return t.trim()
  }
  return ''
}

/** @param {Record<string, unknown>|null|string|undefined} bz */
export const parseXiYongWuXing = (bz) => {
  if (!bz || typeof bz !== 'object') return ''
  const direct = bz['喜用神五行']
  if (typeof direct === 'string' && direct.trim()) return direct.trim()
  const xi = bz['喜忌用神概要']
  if (xi && typeof xi === 'object') {
    const v = xi['喜用神五行'] ?? xi['喜用神'] ?? xi['喜用']
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

/** 忌用神五行（规范文档字段名） */
export const parseJiShenWuXing = (bz) => {
  if (!bz || typeof bz !== 'object') return ''
  const direct = bz['忌用神五行'] ?? bz['忌神五行']
  if (typeof direct === 'string' && direct.trim()) return direct.trim()
  const xi = bz['喜忌用神概要']
  if (xi && typeof xi === 'object') {
    const v = xi['忌用神五行'] ?? xi['忌神五行'] ?? xi['忌用神'] ?? xi['忌用']
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

export const parseBalanceAxes = (bz) => {
  const keys = ['得令', '得地', '得势', '得生']
  const out = {}
  if (!bz || typeof bz !== 'object') return out
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(bz, k)) out[k] = bz[k]
  }
  const nested = bz['身旺身弱'] || bz['身旺身弱分析'] || bz['强弱分析'] || bz['月令旺衰']
  if (nested && typeof nested === 'object') {
    for (const k of keys) {
      if (nested[k] != null && nested[k] !== '') out[k] = nested[k]
    }
  }
  return out
}

/** 天干十神之炁：原样对象，由展示层 v-for 动态渲染 */
export const parseStemTenGods = (bz) => {
  if (!bz || typeof bz !== 'object') return null
  const o = bz['天干十神之炁']
  if (!o || typeof o !== 'object') return null
  return o
}

/** 地支藏干十神之炁 */
export const parseHiddenBranchGods = (bz) => {
  if (!bz || typeof bz !== 'object') return null
  const o = bz['地支藏干十神之炁']
  if (!o || typeof o !== 'object') return null
  return o
}

export const formatAxisValue = (v) => {
  if (typeof v === 'boolean') return v ? '是' : '否'
  if (typeof v === 'number') return String(v)
  if (v && typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export const buildWuxingConicGradient = (totals) => {
  const order = WUXING_ORDER
  const vals = order.map((k) => Math.max(0, Number(totals[k]) || 0))
  const sum = vals.reduce((a, b) => a + b, 0)
  if (sum <= 0) {
    return 'conic-gradient(from -90deg, rgba(200,155,60,0.15) 0deg 360deg)'
  }
  let start = -90
  const parts = []
  order.forEach((k, i) => {
    const deg = (vals[i] / sum) * 360
    const c = WUXING_COLORS[k] || '#666'
    parts.push(`${c} ${start}deg ${start + deg}deg`)
    start += deg
  })
  return `conic-gradient(from -90deg, ${parts.join(',')})`
}

/** 十神名 → 展示用能量类（用于神位 chip） */
export const getTenGodChipClass = (name) => {
  const n = String(name || '')
  if (n.includes('七杀') || n.includes('偏官')) return 'god-kill'
  if (n.includes('正官')) return 'god-official'
  if (n.includes('正印') || n.includes('偏印')) return 'god-seal'
  if (n.includes('劫财') || n.includes('比肩')) return 'god-rob'
  if (n.includes('食神') || n.includes('伤官')) return 'god-output'
  if (n.includes('正财') || n.includes('偏财')) return 'god-wealth'
  return 'god-default'
}

/** 地支法藏显化层：十神能量 aura（与 chip 区分，供法阵 CSS） */
export const getTenGodFormationAura = (name) => {
  const n = String(name || '')
  if (n.includes('七杀') || n.includes('偏官')) return 'formation-7kill'
  if (n.includes('正官')) return 'formation-official'
  if (n.includes('正印')) return 'formation-seal-direct'
  if (n.includes('偏印')) return 'formation-seal-side'
  if (n.includes('劫财') || n.includes('比肩')) return 'formation-rob'
  if (n.includes('伤官')) return 'formation-hurt'
  if (n.includes('食神')) return 'formation-eat'
  if (n.includes('正财') || n.includes('偏财')) return 'formation-wealth'
  return 'formation-default'
}

/** 天干 → 五行（四柱分色 / 藏干 chip 动效） */
export const TIAN_GAN_WUXING = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水'
}

/** 地支本气五行（藏干面板行光晕） */
export const DI_ZHI_WUXING = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水'
}

/**
 * 从干支字符串或 {天干,地支} 拆出天干、地支（用于分字着色）
 * @param {string|Record<string, unknown>|null|undefined} itemOrText
 */
export const splitGanZhi = (itemOrText) => {
  let text = ''
  if (itemOrText == null) return { stem: '', branch: '' }
  if (typeof itemOrText === 'string') text = String(itemOrText).trim()
  else if (typeof itemOrText === 'object') {
    const a = itemOrText.tianGan || itemOrText.天干 || ''
    const b = itemOrText.diZhi || itemOrText.地支 || ''
    text = `${a}${b}`.trim()
  } else text = String(itemOrText)
  const s = text.replace(/\s+/g, '')
  if (!s) return { stem: '', branch: '' }
  if (s.length === 2) return { stem: s[0], branch: s[1] }
  return { stem: s[0] || '', branch: s[s.length - 1] || '' }
}

/** 干支 → 天干五行、地支五行类名用字 */
export const getPillarWuClassPair = (itemOrText) => {
  const { stem, branch } = splitGanZhi(itemOrText)
  return {
    stem,
    branch,
    stemWx: TIAN_GAN_WUXING[stem] || '',
    branchWx: DI_ZHI_WUXING[branch] || ''
  }
}

/** 藏干区块行名（年支/日支等）→ 四柱键 */
export const hiddenBranchKeyToPillarKey = (rowKey) => {
  const k = String(rowKey || '')
  if (k.includes('年')) return '年柱'
  if (k.includes('月')) return '月柱'
  if (k.includes('日')) return '日柱'
  if (k.includes('时')) return '时柱'
  return ''
}

/** 结合命盘四柱，取该行对应地支（供地支五行光晕） */
export const getDiZhiFromBaziForBranchRow = (bz, rowKey) => {
  const pk = hiddenBranchKeyToPillarKey(rowKey)
  if (!pk || !bz || typeof bz !== 'object') return ''
  const raw = bz['四柱干支']?.[pk]
  const { branch } = splitGanZhi(raw)
  return branch
}

export const getBranchRowAuraWuXing = (bz, rowKey) => {
  const dz = getDiZhiFromBaziForBranchRow(bz, rowKey)
  return dz ? DI_ZHI_WUXING[dz] || '' : ''
}

/** 五行能量合计中占比最高者（法阵主频动效） */
export const getDominantWuXing = (feTotals) => {
  let max = -1
  let key = ''
  for (const wx of WUXING_ORDER) {
    const n = Number(feTotals[wx]) || 0
    if (n > max) {
      max = n
      key = wx
    }
  }
  return max > 0 ? key : ''
}
