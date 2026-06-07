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

/** 仅合并 API 实际返回的隐藏词卡；无词条时不占位、不兜底。 */
export const mergeHiddenTraitCards = (slots, apiCards = []) => {
  if (!apiCards?.length) return []

  const slotById = new Map(slots.map((s) => [s.id, s]))

  return apiCards
    .map((hit) => {
      const id = hit.slotId ?? hit.id
      const slot = slotById.get(id)
      if (!slot) return null

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
