const previewEnabled =
  import.meta.env.MODE === 'design' || import.meta.env.VITE_DESIGN_PREVIEW === 'true'

const traitCopy = [
  ['t1', '观澜', '能感知局势中细微的变化，并在复杂信息里找到稳定的方向。'],
  ['t3', '循势', '行动前先辨认环境的流向，一旦确认方向便持续推进。'],
  ['t4', '造境', '擅长把抽象感受转化为可被看见、理解与体验的形式。'],
  ['t5', '静曜', '安静、克制，却有不容忽视的存在感。'],
  ['t6', '澄明', '重视秩序与真实，倾向把事情想清楚后再表达。'],
  ['t7', '和光', '与人相处时自然保留边界，也能让关系保持舒展。'],
  ['t8', '深流', '情感不轻易显露，一旦确认便投入而长久。'],
  ['t9', '求真', '持续被更深层的原因与更完整的答案推动。'],
  ['t10', '归一', '最终倾向把经验收束为自己的体系与表达。']
]

const traits = traitCopy.map(([slotId, title, desc], index) => ({
  slotId,
  opened: index < 3,
  tier: index < 2 ? 'rare' : '',
  yang: { title, annotation: '设计预览示例', desc },
  yin: { title: `${title}之影`, desc: '当能量失衡时，优势也可能变成过度坚持或迟疑。' }
}))

const hiddenCards = [
  {
    slotId: 'ur1',
    opened: false,
    yang: { title: '破界', annotation: '深层原始冲动', desc: '在极端情境下，会本能地打破旧有边界。' },
    yin: { title: '失序', desc: '若缺少清晰目标，破界也可能演变为无序消耗。' }
  },
  {
    slotId: 'ur2',
    opened: false,
    yang: { title: '映心', annotation: '隐藏能力', desc: '能够敏锐捕捉他人未说出口的情绪与需求。' },
    yin: { title: '过载', desc: '过度接收外界信息时，需要主动恢复自己的边界。' }
  }
]

let qiEvents = [
  { id: 'preview-1', date: '2024-03-18', type: 'yang', level: 2, title: '开始新的创作方向', desc: '第一次明确自己想持续表达的视觉语言。' },
  { id: 'preview-2', date: '2024-10-06', type: 'yin', level: 3, title: '项目进入停滞期', desc: '重新审视节奏、边界与工作方法。' },
  { id: 'preview-3', date: '2025-07-22', type: 'yang', level: 4, title: '完成重要作品', desc: '建立了更稳定的创作信心与判断标准。' },
  { id: 'preview-4', date: '2026-05-12', type: 'yang', level: 2, title: '遇见新的合作伙伴', desc: '新的交流带来了不同的观察角度。' }
]

let orders = [
  {
    id: 'YQ-PREVIEW-001',
    productName: '万炁盲盒',
    amountYuan: 300,
    status: 'pending',
    statusLabel: '待支付',
    recipientName: '设计预览用户',
    recipientPhone: '138****0000',
    shippingAddress: '上海市 · 设计预览地址'
  }
]

const chaosQuizNames = [
  ['inner-compass', '内在罗盘', '观察你在复杂选择中更依赖哪一种判断方式'],
  ['social-mask', '社会面具', '探索你在人群中自然呈现的角色'],
  ['energy-boundary', '能量边界', '识别你与外界交换能量时的边界模式'],
  ['creative-source', '创作源流', '找到驱动你持续表达的深层来源'],
  ['decision-rhythm', '决策节律', '理解你从观察到行动的真实节奏'],
  ['relationship-field', '关系场域', '看见你在亲密关系中的互动倾向'],
  ['pressure-response', '压力回声', '观察压力如何改变你的行为与感受'],
  ['hidden-drive', '隐秘驱力', '探索那些未被清晰命名的内在推动力'],
  ['future-image', '未来镜像', '辨认你真正想靠近的生活状态']
]

const chaosQuestions = [
  {
    id: 1,
    prompt: '面对一个全新的方向时，你通常会先做什么？',
    options: [
      { key: 'A', text: '先感受它是否令自己产生共鸣' },
      { key: 'B', text: '先收集信息并建立清晰结构' },
      { key: 'C', text: '先动手尝试，在过程中判断' }
    ]
  },
  {
    id: 2,
    prompt: '当外界意见彼此冲突时，你更倾向于？',
    options: [
      { key: 'A', text: '回到自己的直觉与感受' },
      { key: 'B', text: '比较依据，寻找更可靠的结论' },
      { key: 'C', text: '暂时保留判断，观察事情发展' }
    ]
  },
  {
    id: 3,
    prompt: '什么状态最容易让你恢复能量？',
    options: [
      { key: 'A', text: '独处与安静整理' },
      { key: 'B', text: '与理解自己的人深入交流' },
      { key: 'C', text: '投入一件有明确进展的事情' }
    ]
  }
]

const chaosResult = {
  title: '观潮者',
  summary: '你习惯先感知流向，再决定如何进入局势。',
  yang: '你的优势是敏锐、克制，并能在复杂信息中保持自己的节奏。',
  yin: '当观察持续过久，敏锐也可能变成迟疑。适时行动会让判断真正落地。'
}

const baziAnalysis = {
  四柱干支: { 年柱: '甲子', 月柱: '丙寅', 日柱: '庚辰', 时柱: '壬午' },
  五行能量合计: { 金: 38, 木: 46, 水: 32, 火: 42, 土: 27 },
  十二长生: '临官',
  综合判定: '能量中和，木火相生',
  出生方位: '东方',
  日主: '庚金',
  身旺身弱: { 判定: '中和偏强', 得令: '是', 得地: '是', 得势: '否', 得生: '是' },
  喜忌用神概要: { 喜用神: '水、木', 忌用神: '土、金' },
  天干十神之炁: { 年柱: '偏财', 月柱: '七杀', 日柱: '日主', 时柱: '食神' },
  地支藏干十神之炁: { 子: ['伤官'], 寅: ['偏财', '七杀'], 辰: ['偏印'], 午: ['正官'] }
}

const parseData = (data) => {
  if (!data || typeof data !== 'string') return data || {}
  try {
    return JSON.parse(data)
  } catch {
    return {}
  }
}

const traitPayload = () => ({
  cards: traits,
  hiddenCards,
  hiddenDiscovery: {
    dayZhi: '辰',
    count: hiddenCards.length,
    showModal: true,
    modalMessage: '你已触及恒炁深处，隐藏词卡正在显现。'
  }
})

export const isDesignPreviewMode = () => previewEnabled

export const bootstrapDesignPreviewSession = () => {
  if (!previewEnabled) return
  localStorage.setItem('token', 'design-preview-token')
  localStorage.setItem('user', JSON.stringify({ id: 'design-preview', username: '设计预览用户' }))
  localStorage.setItem('last_active_at', String(Date.now()))
}

export const resolveDesignPreviewRequest = (config) => {
  const method = String(config.method || 'get').toLowerCase()
  const url = String(config.url || '').split('?')[0]
  const data = parseData(config.data)

  if (url.includes('/api/Auth/userinfo')) return { id: 'design-preview', username: '设计预览用户' }
  if (url === '/api/me/bazi') return { baziAnalysis }
  if (url === '/api/me/henqi') return { xianTianHengQi: 7284 }
  if (url === '/api/me/trait-cards' && method === 'get') return traitPayload()
  if (/\/api\/me\/trait-cards\/[^/]+\/open$/.test(url)) return { success: true }
  if (url === '/api/me/radar-charts') {
    const labels = ['智慧谋略', '领导决断', '亲和仁爱', '行动执行', '艺术才华', '社交人缘', '稳定耐心', '理财经营']
    return {
      explicitProfile: { title: '显性矩阵剖面', labels, values: [8, 6, 7, 8, 9, 6, 7, 5] },
      implicitProfile: { title: '隐性矩阵剖面', labels, values: [9, 7, 6, 5, 8, 5, 8, 6] }
    }
  }
  if (url === '/api/me/bianqi') {
    return {
      dayun: {
        available: true,
        opened: true,
        openSlotId: 'preview-dayun',
        adjustedBuffExact: 18.6,
        trait: {
          yang: { title: '生发', subtitle: '大运之炁', desc: '适合建立新的结构，并让长期积累逐渐显形。' },
          yin: { title: '蔓延', subtitle: '失衡提醒', desc: '方向过多时，能量容易被分散。' }
        }
      },
      liunian: {
        available: true,
        opened: true,
        openSlotId: 'preview-liunian',
        adjustedBuffExact: -6.8,
        trait: {
          yang: { title: '沉潜', subtitle: '流年之炁', desc: '适合整理、复盘与打磨尚未成熟的表达。' },
          yin: { title: '凝滞', subtitle: '失衡提醒', desc: '谨慎过度时，可能错过行动窗口。' }
        }
      }
    }
  }
  if (url === '/api/me/qi-events' && method === 'get') return { items: qiEvents }
  if (url === '/api/me/qi-events' && method === 'post') {
    const created = { id: `preview-${Date.now()}`, ...data }
    qiEvents = [...qiEvents, created]
    return created
  }
  if (url === '/api/me/chaos-quizzes/hub') {
    return {
      data: {
        quizzes: chaosQuizNames.map(([slug, title, summary]) => ({
          slug,
          title,
          summary,
          questionCount: chaosQuestions.length,
          hasSavedResult: false
        }))
      }
    }
  }
  if (/\/api\/me\/chaos-quizzes\/[^/]+\/submit$/.test(url)) {
    return { data: { result: chaosResult } }
  }
  if (/\/api\/me\/chaos-quizzes\/[^/]+\/reset$/.test(url)) {
    return { data: { success: true } }
  }
  if (/\/api\/me\/chaos-quizzes\/[^/]+$/.test(url)) {
    const slug = url.split('/').at(-1)
    const meta = chaosQuizNames.find(([itemSlug]) => itemSlug === slug) || chaosQuizNames[0]
    return {
      data: {
        slug,
        title: meta[1],
        summary: meta[2],
        introText: '答案已经汇聚成形。现在，看看它映照出的你。',
        outroText: '测试仅作娱乐与自我观察，不定义真实的你。',
        questions: chaosQuestions,
        savedAttempt: null
      }
    }
  }
  if (url === '/api/me/shop/orders' && method === 'get') return { items: orders }
  if (url === '/api/me/shop/orders' && method === 'post') {
    const created = {
      id: `YQ-PREVIEW-${Date.now()}`,
      productName: data.productSku === 'guaiqi_box' ? '怪炁盲盒' : '万炁盲盒',
      amountYuan: data.productSku === 'guaiqi_box' ? 200 : 300,
      status: 'pending',
      statusLabel: '待支付',
      ...data
    }
    orders = [created, ...orders]
    return { data: created }
  }
  if (/\/api\/me\/shop\/orders\/[^/]+\/pay$/.test(url)) {
    const id = url.split('/').at(-2)
    orders = orders.map((order) =>
      order.id === id ? { ...order, status: 'paid', statusLabel: '已支付' } : order
    )
    return { success: true }
  }
  if (url === '/api/Region/provinces') return ['北京市', '上海市', '浙江省']
  if (url === '/api/Region/cities') return ['设计预览市']
  if (url.includes('/api/Pillar/years')) return [2024, 2025, 2026]
  if (url.includes('/api/Pillar/months')) return Array.from({ length: 12 }, (_, index) => index + 1)
  if (url.includes('/api/Pillar/days')) return Array.from({ length: 31 }, (_, index) => index + 1)

  return { success: true, preview: true }
}
