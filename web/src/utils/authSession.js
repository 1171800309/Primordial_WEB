import { clearSession, touchSession } from './session'

const pickToken = (obj) => {
  if (!obj || typeof obj !== 'object') return ''
  return obj.token || obj.accessToken || obj.access_token || obj.jwt || ''
}

const pickUser = (obj, fallback = {}) => {
  if (!obj || typeof obj !== 'object') return fallback
  if (obj.user && typeof obj.user === 'object') return obj.user
  if (obj.id != null || obj.username) {
    return {
      id: obj.id,
      username: obj.username,
      userType: obj.userType || 'member',
      gender: obj.gender
    }
  }
  return fallback
}

const pickHourSummary = (obj) => ({
  hourTianGan: obj?.hourTianGan || '',
  hourDiZhi: obj?.hourDiZhi || '',
  hourGanZhi: obj?.hourGanZhi || '',
  actualBirthTime: obj?.actualTime ?? obj?.actualBirthTime ?? '',
  longitudeCorrectionMinutes: obj?.longitudeCorrectionMinutes ?? ''
})

/** 兼容多种后端返回结构，提取 token / user / 命盘数据 */
export function extractAuthPayload(res, fallbackUser = {}) {
  const layers = [res, res?.data, res?.data?.data, res?.result, res?.data?.result].filter(
    (x) => x && typeof x === 'object' && !Array.isArray(x)
  )

  let token = ''
  let user = null
  let baziAnalysis = null
  let hourSummary = pickHourSummary({})

  for (const layer of layers) {
    if (!token) token = pickToken(layer)
    if (!user || user === fallbackUser) {
      const nextUser = pickUser(layer, fallbackUser)
      if (nextUser && (nextUser.id != null || nextUser.username)) user = nextUser
    }
    if (layer.baziAnalysis !== undefined && layer.baziAnalysis !== null) {
      baziAnalysis = layer.baziAnalysis
    }
    hourSummary = {
      ...hourSummary,
      ...pickHourSummary(layer)
    }
  }

  return {
    token,
    user: user || fallbackUser,
    baziAnalysis,
    hourSummary
  }
}

export function saveAuthSession({ token, user }) {
  if (!token) return false

  clearSession()
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  touchSession()
  return true
}

export async function navigateToHub(router) {
  await router.replace({ name: 'hub' })
}

let skipNextTokenValidation = false

/** 登录/注册成功后调用，避免路由守卫立刻 validate 失败被踢回登录页 */
export function skipTokenValidationOnce() {
  skipNextTokenValidation = true
}

export function consumeSkipTokenValidation() {
  if (!skipNextTokenValidation) return false
  skipNextTokenValidation = false
  return true
}
