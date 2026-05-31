export const QI_LEVEL_NAMES = {
  1: '日常涟漪',
  2: '铭记时刻',
  3: '重要里程碑',
  4: '影响深远',
  5: '人生转折点'
}

/** 与 docs/prototypes/气象台.html 撰写新炁象表单一致 */
export const QI_LEVEL_TOOLTIPS = {
  1: '微小但真实。构成生命底色的小确幸或小烦恼。如路人的微笑、丢了外卖。',
  2: '情绪强烈、记忆深刻，但未改变主线（影响数周至1年）。如意外的胜利、绝美风景、当众受挫。',
  3: '引发阶段性显著变化，让你明显感到“上/下了一个台阶”（影响1–5年）。如通过关键考试、结束某段关系。',
  4: '塑造了长达数年的人生阶段，形成持续优势或深层阴影（影响5年以上）。如结识一生挚友、被极度信任的人背叛。',
  5: '从根本上扭转了人生轨迹、自我认知的事件。若无此事，你将是另一个人。如重大疾病重生、换赛道创业。'
}

export const QI_LEVEL_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({
  value,
  label: `Lv${value} ${QI_LEVEL_NAMES[value]}`,
  tooltip: QI_LEVEL_TOOLTIPS[value]
}))
