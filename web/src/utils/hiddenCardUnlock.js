const storageKey = (userId) => `xq_hidden_unlock_ack_${userId}`

export function getCurrentUserId() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const user = JSON.parse(raw)
    const id = user?.id ?? user?.userId
    return id != null ? String(id) : null
  } catch {
    return null
  }
}

/** 用户已看过先天页首次「机缘触发」隐藏词卡提示 */
export function loadHiddenUnlockAck(userId = getCurrentUserId()) {
  if (!userId) return false
  return localStorage.getItem(storageKey(userId)) === '1'
}

export function saveHiddenUnlockAck(userId = getCurrentUserId()) {
  if (!userId) return
  localStorage.setItem(storageKey(userId), '1')
}
