/** 隐藏词卡槽位 UI（词条内容待词库接入） */
export const HIDDEN_TRAIT_CARD_SLOTS = [
  {
    id: 'ur1',
    label: '深层原始冲动特性',
    cover: '“我在极端情境下<br>才会被激活的原始本能”',
    yang: {
      title: '修罗',
      annotation: '撕裂常规的毁灭与重塑之力。',
      desc: '在绝境与极度高压下，常规道德与理性会被瞬间剥离，爆发出纯粹的生存与反击本能。'
    },
    yin: {
      desc: '一旦开启，极其容易带来不可逆的破坏，甚至在狂热中反噬自身曾经最珍视的羁绊与事物。'
    }
  },
  {
    id: 'ur2',
    label: '隐藏能力特性',
    cover: '“我内心深处藏着<br>但自己未必知道的才能”',
    yang: {
      title: '虚空造物',
      annotation: '无中生有的直觉构筑力。',
      desc: '能够从绝对的无序和混乱中，瞬间抓取核心规律，凭直觉搭建出全新的规则或系统。'
    },
    yin: {
      desc: '过于超前与跳跃的思维内核，常使得在世俗沟通中显得极其孤僻与傲慢，难以被同频理解。'
    }
  }
]

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
