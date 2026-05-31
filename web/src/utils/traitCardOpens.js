const storageKey = (userId) => `xiantian_trait_opens_${userId}`

export function loadTraitOpens(userId) {
  if (!userId) return {}
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveTraitOpen(userId, slotId, opened = true) {
  if (!userId || !slotId) return
  const current = loadTraitOpens(userId)
  current[slotId] = opened
  localStorage.setItem(storageKey(userId), JSON.stringify(current))
}

export function mergeTraitOpens(cards, userId, serverOpens = {}) {
  const local = loadTraitOpens(userId)
  return cards.map((card) => ({
    ...card,
    opened: Boolean(serverOpens[card.id] ?? local[card.id])
  }))
}
