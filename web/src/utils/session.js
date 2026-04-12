const LAST_ACTIVE_AT_KEY = 'last_active_at'
const IDLE_TIMEOUT_MS = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS || 5 * 60 * 1000)

export const touchSession = () => {
  localStorage.setItem(LAST_ACTIVE_AT_KEY, String(Date.now()))
}

export const clearSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem(LAST_ACTIVE_AT_KEY)
}

export const isSessionIdleExpired = () => {
  const token = localStorage.getItem('token')
  if (!token) return true

  const lastActiveAt = Number(localStorage.getItem(LAST_ACTIVE_AT_KEY) || 0)
  if (!lastActiveAt) {
    touchSession()
    return false
  }

  return Date.now() - lastActiveAt > IDLE_TIMEOUT_MS
}

export const getIdleTimeoutMs = () => IDLE_TIMEOUT_MS

