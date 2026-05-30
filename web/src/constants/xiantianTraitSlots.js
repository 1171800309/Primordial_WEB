/** 先天页 10 张词卡槽位 UI 元数据（封面文案来自原型，词条内容由 /api/me/trait-cards 填充） */
export const XIANTIAN_TRAIT_SLOTS = [
  {
    id: 't1',
    label: '先天特性',
    iconName: 'book',
    coverCenter: false,
    cover:
      '它是你生命最底层的“源代码”，不因环境而改变，不因际遇而转移。你一生会经历无数事，扮演无数角色，但那个最核心的“性”，从你投胎而来的那一刻，就已经写定了。'
  },
  {
    id: 't2',
    label: '先天禀性',
    iconName: 'triangle',
    coverCenter: true,
    cover: '我携带什么样的能量，来到一个什么样的世界？'
  },
  {
    id: 't3',
    label: '先天行为特性',
    iconName: 'arrow',
    coverCenter: false,
    cover: '与生俱来的“行动方式”——不是你要做什么，而是你无论做什么都改不掉的“做法”。'
  },
  {
    id: 't4',
    label: '先天天赋特性',
    iconName: 'sun',
    coverCenter: true,
    cover: '我得天生拥有什么样的天赋？'
  },
  {
    id: 't5',
    label: '先天气质特性',
    iconName: 'cross',
    coverCenter: true,
    cover: '我天生带着怎样的气质？'
  },
  {
    id: 't6',
    label: '先天性格底色特性',
    iconName: 'square',
    coverCenter: true,
    cover: '我天生具有怎样的性格底色？'
  },
  {
    id: 't7',
    label: '社会人格特性',
    iconName: 'wave',
    coverCenter: true,
    cover: '我与世界如何互动？'
  },
  {
    id: 't8',
    label: '情感特性',
    iconName: 'heart',
    coverCenter: true,
    cover: '“我在最亲密的关系里是什么样子？”'
  },
  {
    id: 't9',
    label: '潜在驱动力特性',
    iconName: 'clock',
    coverCenter: true,
    cover: '你潜意识深处藏着怎样的动力秘密？'
  },
  {
    id: 't10',
    label: '终极倾向特性',
    iconName: 'peak',
    coverCenter: true,
    cover: '我这一生，最终要走向哪里？'
  }
]

export const buildFallbackTrait = (slot) => ({
  id: slot.id,
  label: slot.label,
  iconName: slot.iconName,
  coverCenter: slot.coverCenter,
  cover: slot.cover,
  tier: '',
  yang: { title: '—', annotation: '', desc: '暂无匹配词条，请确认词库已导入。' },
  yin: { title: '', desc: '暂无阴面释义。' }
})

export const mergeTraitCards = (slots, apiCards = []) => {
  const bySlot = new Map((apiCards || []).map((c) => [c.slotId, c]))
  return slots.map((slot) => {
    const hit = bySlot.get(slot.id)
    if (!hit) return buildFallbackTrait(slot)
    return {
      id: slot.id,
      label: hit.label || slot.label,
      iconName: slot.iconName,
      coverCenter: slot.coverCenter,
      cover: slot.cover,
      tier: hit.tier || '',
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
}
