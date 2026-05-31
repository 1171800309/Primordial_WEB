/** 禀性 / 天赋 / 性格底色 词卡等级说明（左上角徽章 hover 提示） */
export const TIER_SLOTS = new Set(['t2', 't4', 't6'])

export const TIER_META = {
  'tier-gold': {
    label: '金',
    title: '金色词卡',
    desc: '核心禀赋层级，能量最为突出，对人格与行事风格影响显著。'
  },
  'tier-yellow': {
    label: '黄',
    title: '黄色词卡',
    desc: '重要特质层级，在先天结构中占有较高权重。'
  },
  'tier-black': {
    label: '灰',
    title: '灰色词卡',
    desc: '基础底色层级，构成人格的稳定底层倾向。'
  }
}

export function tierMetaFor(tier) {
  if (!tier) return null
  return TIER_META[tier] ?? null
}
