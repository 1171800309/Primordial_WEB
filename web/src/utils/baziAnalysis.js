/**
 * 读取缓存的八字分析（HTTP 优先字段名 baziAnalysis）。
 * 兼容旧版 localStorage key fateAnalysis（读一次后不再写回旧 key）。
 */
import {
  parseTwelveStage,
  parseCompositeJudgment,
  parseBirthDirection,
  parseBodyStrengthSnippet,
  parseXiYongWuXing,
  parseJiShenWuXing,
  parseFiveElementsTotal,
  parseBalanceAxes,
  formatAxisValue,
  parseStemTenGods,
  parseHiddenBranchGods,
  WUXING_ORDER
} from '@/utils/destinyModel'

const STORAGE_KEY = 'baziAnalysis'
const LEGACY_KEY = 'fateAnalysis'

export const readStoredBaziAnalysis = () => {
  const tryParse = (raw) => {
    if (raw == null || raw === '') return undefined
    try {
      return JSON.parse(raw)
    } catch {
      return undefined
    }
  }

  const v = tryParse(localStorage.getItem(STORAGE_KEY))
  if (v !== undefined) return v

  const legacy = tryParse(localStorage.getItem(LEGACY_KEY))
  if (legacy !== undefined) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    localStorage.removeItem(LEGACY_KEY)
    return legacy
  }
  return null
}

export const persistBaziAnalysis = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data ?? null))
}

/** 从 JWT payload 解析 claim bazi_analysis（JSON 字符串） */
export const parseBaziAnalysisFromToken = (token) => {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4
    if (pad) b64 += '='.repeat(4 - pad)
    const json = atob(b64)
    const payload = JSON.parse(json)
    const raw = payload.bazi_analysis ?? payload.baziAnalysis
    if (raw == null || raw === '') return null
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw)
      } catch {
        return raw
      }
    }
    return raw
  } catch {
    return null
  }
}

const formatPillar = (item) => {
  if (!item) return ''
  if (typeof item === 'string') return item
  return `${item.tianGan || item.天干 || ''}${item.diZhi || item.地支 || ''}`.trim()
}

const STEM_GOD_META = new Set(['喜用十神', '忌用十神', '喜用', '忌用'])

const formatWuxingTotalsLine = (bz) => {
  const t = parseFiveElementsTotal(bz)
  return WUXING_ORDER.map((k) => `${k} ${t[k] ?? 0}`).join('　')
}

const formatBalanceAxesLine = (bz) => {
  const axes = parseBalanceAxes(bz)
  const entries = Object.entries(axes).filter(([, v]) => v != null && v !== '')
  if (!entries.length) return ''
  return entries.map(([k, v]) => `${k}：${formatAxisValue(v)}`).join('　')
}

const formatStemTenGodsBlock = (bz) => {
  const o = parseStemTenGods(bz)
  if (!o || typeof o !== 'object') return ''
  const lines = []
  for (const [k, v] of Object.entries(o)) {
    if (STEM_GOD_META.has(k)) continue
    let val = ''
    if (v == null) val = ''
    else if (typeof v === 'object') {
      try {
        val = JSON.stringify(v)
      } catch {
        val = String(v)
      }
    } else val = String(v)
    lines.push(`${k}：${val}`)
  }
  return lines.join('\n')
}

const formatHiddenBranchesBlock = (bz) => {
  const o = parseHiddenBranchGods(bz)
  if (!o || typeof o !== 'object') return ''
  try {
    return JSON.stringify(o, null, 2)
  } catch {
    return ''
  }
}

const formatTianGan12EnergyBlock = (bz) => {
  if (!bz || typeof bz !== 'object') return ''
  const raw = bz['天干十二长生与能量']
  if (raw == null) return ''
  if (typeof raw === 'string') return raw.trim()
  if (typeof raw === 'object') {
    try {
      return JSON.stringify(raw, null, 2)
    } catch {
      return ''
    }
  }
  return String(raw)
}

const pickStr = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return ''
  for (const k of keys) {
    const v = obj[k]
    if (v == null || v === '') continue
    if (typeof v === 'string' || typeof v === 'number') return String(v)
    if (typeof v === 'object') {
      const s = formatPillar(v)
      if (s) return s
    }
  }
  return ''
}

/** 四柱干支中除常见键外的其余键（接口扩展） */
const formatExtraPillarText = (pillars) => {
  if (!pillars || typeof pillars !== 'object') return ''
  const fixed = new Set(['年柱', '月柱', '日柱', '时柱', '大运', '流年', '流月'])
  const parts = []
  for (const [k, v] of Object.entries(pillars)) {
    if (fixed.has(k)) continue
    const s = pickStr({ [k]: v }, [k])
    if (s) parts.push(`${k}：${s}`)
  }
  return parts.join('；')
}

/** 纳音五行能量中除四柱外的其余键 */
const formatExtraNaYinText = (root) => {
  if (!root || typeof root !== 'object') return ''
  const fixed = new Set(['年柱', '月柱', '日柱', '时柱'])
  const parts = []
  for (const [k, v] of Object.entries(root)) {
    if (fixed.has(k)) continue
    const s = pickStr({ [k]: v }, [k])
    if (s) parts.push(`${k}：${s}`)
  }
  return parts.join('；')
}

/**
 * 将 baziAnalysis（内部多为中文键）映射到首页「八字五行分析」表单字段。
 */
export const mapBaziAnalysisToForm = (bz) => {
  const empty = {
    yearPillar: '',
    monthPillar: '',
    dayPillar: '',
    hourPillar: '',
    majorLuckPillar: '',
    flowYear: '',
    flowMonth: '',
    flowYearMonthPillar: '',
    usefulElement: '',
    unfavorableElement: '',
    dayMaster: '',
    bodyStrengthSnippet: '',
    usefulTenGods: '',
    unfavorableTenGods: '',
    xiYongWuXingPort: '',
    jiShenWuXingPort: '',
    yearNaYin: '',
    monthNaYin: '',
    dayNaYin: '',
    hourNaYin: '',
    extraNaYinText: '',
    wuxingEnergyLine: '',
    twelveStage: '',
    compositeJudgment: '',
    birthDirection: '',
    balanceAxesLine: '',
    stemTenGodsDetail: '',
    hiddenBranchesDetail: '',
    tianGan12EnergyBlock: '',
    extraPillarText: '',
    statusText: '暂无八字分析数据'
  }

  if (bz == null) return empty
  if (typeof bz === 'string') {
    return { ...empty, statusText: bz }
  }
  if (typeof bz !== 'object') return empty

  const hint = bz['提示']
  if (hint && typeof hint === 'string' && Object.keys(bz).length <= 2) {
    return { ...empty, statusText: hint }
  }

  const pillars = bz['四柱干支'] || {}
  const naYinRoot = bz['纳音五行能量'] || bz.naYin || bz.nayin || {}
  const xiJi = bz['喜忌用神概要'] || {}
  const usefulGods = bz['天干十神之炁'] || bz['usefulGods'] || {}

  const yearPillar = pickStr(pillars, ['年柱', 'year', 'Year'])
  const monthPillar = pickStr(pillars, ['月柱', 'month', 'Month'])
  const dayPillar = pickStr(pillars, ['日柱', 'day', 'Day'])
  const hourPillar = pickStr(pillars, ['时柱', 'hour', 'Hour'])
  const majorLuckPillar = pickStr(pillars, ['大运', 'majorLuck', 'MajorLuck'])
  const flowY = pickStr(pillars, ['流年', 'flowYear', 'FlowYear'])
  const flowM = pickStr(pillars, ['流月', 'flowMonth', 'FlowMonth'])
  const flowYearMonthPillar =
    flowY || flowM ? `${flowY}${flowY && flowM ? ' / ' : ''}${flowM}`.trim() : ''

  const usefulElement =
    pickStr(xiJi, ['喜用神', '喜用', 'usefulElement']) ||
    pickStr(bz, ['喜用神五行', '喜用神', '五行喜用']) ||
    ''
  const unfavorableElement =
    pickStr(xiJi, ['忌用神', '忌用', 'unfavorableElement']) ||
    pickStr(bz, ['忌用神五行', '忌用神', '五行忌用']) ||
    ''

  const dayMasterStr =
    pickStr(bz, ['日主', '日元']) ||
    pickStr(usefulGods, ['日主', '日元', 'dayMaster']) ||
    pickStr(usefulGods, ['日干'])

  const bodyStrengthSnippet = parseBodyStrengthSnippet(bz)

  const usefulTenGods = usefulGods['喜用十神'] || usefulGods.usefulTenGods
  const unfavorableTenGods = usefulGods['忌用十神'] || usefulGods.unfavorableTenGods

  const naYinYear = pickStr(naYinRoot, ['年柱', 'year', 'Year'])
  const naYinMonth = pickStr(naYinRoot, ['月柱', 'month', 'Month'])
  const naYinDay = pickStr(naYinRoot, ['日柱', 'day', 'Day'])
  const naYinHour = pickStr(naYinRoot, ['时柱', 'hour', 'Hour'])

  const xiYongPort = parseXiYongWuXing(bz) || usefulElement
  const jiShenPort = parseJiShenWuXing(bz) || unfavorableElement

  const statusText =
    (typeof hint === 'string' && hint) ||
    (yearPillar || monthPillar || dayPillar ? '已加载八字分析数据' : '暂无八字分析数据')

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    majorLuckPillar,
    flowYear: flowY,
    flowMonth: flowM,
    flowYearMonthPillar,
    usefulElement,
    unfavorableElement,
    dayMaster: dayMasterStr,
    bodyStrengthSnippet,
    usefulTenGods: Array.isArray(usefulTenGods) ? usefulTenGods.join('、') : pickStr(usefulGods, ['喜用']),
    unfavorableTenGods: Array.isArray(unfavorableTenGods)
      ? unfavorableTenGods.join('、')
      : pickStr(usefulGods, ['忌用']),
    xiYongWuXingPort: xiYongPort,
    jiShenWuXingPort: jiShenPort,
    yearNaYin: naYinYear,
    monthNaYin: naYinMonth,
    dayNaYin: naYinDay,
    hourNaYin: naYinHour,
    extraNaYinText: formatExtraNaYinText(naYinRoot),
    wuxingEnergyLine: formatWuxingTotalsLine(bz),
    twelveStage: parseTwelveStage(bz),
    compositeJudgment: parseCompositeJudgment(bz),
    birthDirection: parseBirthDirection(bz),
    balanceAxesLine: formatBalanceAxesLine(bz),
    stemTenGodsDetail: formatStemTenGodsBlock(bz),
    hiddenBranchesDetail: formatHiddenBranchesBlock(bz),
    tianGan12EnergyBlock: formatTianGan12EnergyBlock(bz),
    extraPillarText: formatExtraPillarText(pillars),
    statusText
  }
}
