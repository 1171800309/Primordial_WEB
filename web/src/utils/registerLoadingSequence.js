import { mapBaziAnalysisToForm } from '@/utils/baziAnalysis'
import {
  parseFiveElementsTotal,
  parseStemTenGods,
  parseHiddenBranchGods,
  WUXING_ORDER
} from '@/utils/destinyModel'

const pickStr = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return ''
  for (const k of keys) {
    const v = obj[k]
    if (v == null || v === '') continue
    if (typeof v === 'string' || typeof v === 'number') return String(v)
  }
  return ''
}

const formatBaziLine = (form) => {
  const parts = [form.yearPillar, form.monthPillar, form.dayPillar, form.hourPillar].filter(Boolean)
  return parts.length ? parts.join('　') : '—'
}

const formatWuxingCounts = (bz) => {
  const raw = bz?.['八字五行数量']
  if (raw && typeof raw === 'object') {
    return WUXING_ORDER.map((k) => `${k}${raw[k] ?? 0}`).join('　')
  }
  const totals = parseFiveElementsTotal(bz)
  return WUXING_ORDER.map((k) => `${k}${totals[k] ?? 0}`).join('　')
}

const formatNaYinLine = (form) => {
  const parts = [
    form.yearNaYin && `年${form.yearNaYin}`,
    form.monthNaYin && `月${form.monthNaYin}`,
    form.dayNaYin && `日${form.dayNaYin}`,
    form.hourNaYin && `时${form.hourNaYin}`
  ].filter(Boolean)
  return parts.length ? parts.join('　') : '—'
}

const formatStemTenGodsLine = (bz) => {
  const o = parseStemTenGods(bz)
  if (!o || typeof o !== 'object') return '—'
  const skip = new Set(['喜用十神', '忌用十神', '喜用', '忌用', '日主', '日元', '日干'])
  const parts = []
  for (const [k, v] of Object.entries(o)) {
    if (skip.has(k)) continue
    if (v == null || v === '') continue
    parts.push(`${k}：${typeof v === 'object' ? JSON.stringify(v) : v}`)
  }
  return parts.length ? parts.join('　') : '—'
}

const formatHiddenGodsLine = (bz) => {
  const o = parseHiddenBranchGods(bz)
  if (!o || typeof o !== 'object') return '—'
  const parts = []
  for (const [pillar, val] of Object.entries(o)) {
    if (val == null) continue
    if (typeof val === 'object') {
      const inner = Object.entries(val)
        .map(([k, v]) => `${k}${v ?? ''}`)
        .join('/')
      parts.push(`${pillar}：${inner}`)
    } else {
      parts.push(`${pillar}：${val}`)
    }
  }
  return parts.length ? parts.join('　') : '—'
}

const formatBodyStrengthLine = (bz) => {
  const o = bz?.['身旺身弱']
  if (!o || typeof o !== 'object') {
    return pickStr(bz, ['综合判定', '日主强弱简版_v1']) || '—'
  }
  const verdict = pickStr(o, ['综合判定', '判定', '结论']) || pickStr(bz, ['综合判定'])
  const bits = ['得令', '得地', '得势', '得生', '得助']
    .map((k) => {
      if (!(k in o)) return ''
      const v = o[k]
      const text = typeof v === 'boolean' ? (v ? '是' : '否') : String(v ?? '')
      return `${k}${text}`
    })
    .filter(Boolean)
  const score = o['量化得分']
  const scoreText = score != null && score !== '' ? `量化${score}` : ''
  const tail = [scoreText, verdict].filter(Boolean).join('，')
  return bits.length ? `${bits.join('　')}｜${tail || '—'}` : tail || '—'
}

const formatDayunLine = (bz) => {
  const dayun = bz?.['大运']
  if (!dayun || typeof dayun !== 'object') return '—'
  const start = pickStr(dayun, ['起运时间', '起运时刻', '起运'])
  const current = pickStr(dayun, ['当前大运甲子', '当前大运']) || pickStr(dayun?.['当前大运'], ['甲子', '干支'])
  const seq = Array.isArray(dayun['大运序列']) ? dayun['大运序列'] : []
  const first = seq[0]
  const firstGz = first && typeof first === 'object' ? pickStr(first, ['甲子', '干支']) : ''
  const tenGod = first && typeof first === 'object' ? pickStr(first, ['十神', '天干十神']) : ''
  const parts = []
  if (start) parts.push(`起运${start}`)
  if (current) parts.push(`当前大运${current}`)
  else if (firstGz) parts.push(`首运${firstGz}`)
  if (tenGod) parts.push(`十神${tenGod}`)
  return parts.length ? parts.join('　') : '—'
}

/** 慢—快—慢：首尾约 1.3s，中段逐渐加速，总时长约 6.2s */
export const REGISTER_LOADING_DURATIONS_MS = [
  1300, 550, 480, 430, 390, 350, 310, 270, 230, 210, 190, 170, 1300
]

/**
 * @param {object|null} baziAnalysis
 * @returns {{ label: string, detail?: string }[]}
 */
export const buildRegisterLoadingSteps = (baziAnalysis) => {
  const form = mapBaziAnalysisToForm(baziAnalysis)
  const bz = baziAnalysis && typeof baziAnalysis === 'object' ? baziAnalysis : {}

  return [
    { label: '正在匹配源数据库' },
    { label: '能量频率校正中' },
    { label: '频率已确认' },
    { label: '底层频率为', detail: formatBaziLine(form) },
    { label: '正五行分布', detail: formatWuxingCounts(bz) },
    { label: '四柱纳音', detail: formatNaYinLine(form) },
    { label: '天干十神', detail: formatStemTenGodsLine(bz) },
    { label: '地支藏干十神', detail: formatHiddenGodsLine(bz) },
    { label: '身旺身弱演算', detail: formatBodyStrengthLine(bz) },
    { label: '大运起运', detail: formatDayunLine(bz) },
    { label: '先天特性提取中' },
    { label: '时空维度能量buff计算中' },
    { label: '加载完毕，即将进入主页' }
  ]
}

export const getRegisterLoadingTotalMs = () =>
  REGISTER_LOADING_DURATIONS_MS.reduce((sum, ms) => sum + ms, 0)

/** 0–1 进度 → Logo 旋转周期（秒）：慢起、快中、慢收 */
export const getLogoSpinDurationSec = (progress) => {
  const p = Math.min(1, Math.max(0, progress))
  if (p <= 0.12) return 4.2 - p * 8
  if (p >= 0.88) return 1.2 + (p - 0.88) * 25
  const mid = (p - 0.12) / 0.76
  return 1.2 + (1 - mid) * 2.2
}
