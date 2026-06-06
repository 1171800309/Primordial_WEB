/** 隐藏词卡槽位 UI（词条内容由 /api/me/trait-cards hiddenCards 填充） */
export const HIDDEN_TRAIT_CARD_SLOTS = [
  {
    id: 'ur1',
    label: '深层原始冲动特性',
    cover: '“我在极端情境下<br>才会被激活的原始本能”',
  },
  {
    id: 'ur2',
    label: '隐藏能力特性',
    cover: '“我内心深处藏着<br>但自己未必知道的才能”',
  }
]

export const buildFallbackHiddenCard = (slot) => ({
  id: slot.id,
  label: slot.label,
  cover: slot.cover,
  opened: false,
  yang: { title: '—', annotation: '', desc: '暂无匹配词条，请确认隐藏词库已导入。' },
  yin: { title: '', desc: '暂无阴面释义。' }
})

/** 与后端 DayBranchHiddenCardPolicy 一致的前端兜底 */
export const resolveHiddenDiscovery = (dayZhi) => {
  const zhi = String(dayZhi || '').trim()
  if (!zhi) {
    return { dayZhi: null, count: 0, showModal: false, modalMessage: null }
  }
  if (zhi === '子' || zhi === '卯' || zhi === '酉') {
    return { dayZhi: zhi, count: 0, showModal: false, modalMessage: null }
  }
  if (zhi === '午' || zhi === '亥') {
    return { dayZhi: zhi, count: 1, showModal: true, modalMessage: '你有一张隐藏词卡待开启' }
  }
  return { dayZhi: zhi, count: 2, showModal: true, modalMessage: '你有2张隐藏词卡待开启' }
}

/** 1 张时仅 ur2（中气）；2 张时 ur1+ur2 */
export const resolveVisibleHiddenSlotIds = (count) => {
  const n = Math.max(0, Number(count) || 0)
  if (n >= 2) return ['ur1', 'ur2']
  if (n === 1) return ['ur2']
  return []
}

export const mergeHiddenTraitCards = (slots, apiCards = [], count = 0) => {
  const bySlot = new Map((apiCards || []).map((c) => [c.slotId ?? c.id, c]))
  const slotById = new Map(slots.map((s) => [s.id, s]))
  const ids = apiCards?.length
    ? apiCards.map((c) => c.slotId ?? c.id)
    : resolveVisibleHiddenSlotIds(count)

  return ids
    .map((id) => {
      const slot = slotById.get(id)
      if (!slot) return null
      const hit = bySlot.get(id)
      if (!hit) return buildFallbackHiddenCard(slot)
      return {
        id: slot.id,
        label: hit.label || slot.label,
        cover: slot.cover,
        opened: Boolean(hit.opened),
        yang: {
          title: hit.yang?.title || '—',
          annotation: hit.yang?.annotation || '',
          desc: hit.yang?.desc || ''
        },
        yin: {
          title: hit.yin?.title || '',
          desc: hit.yin?.desc || ''
        }
      }
    })
    .filter(Boolean)
}
