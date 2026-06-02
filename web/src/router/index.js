import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Register from '../views/Register.vue'
import HubPage from '../views/HubPage.vue'
import LandingPage from '../views/LandingPage.vue'
import XianTianPage from '../views/XianTianPage.vue'
import BianQiPage from '../views/BianQiPage.vue'
import QiXiangTaiPage from '../views/QiXiangTaiPage.vue'
import WanQiPage from '../views/WanQiPage.vue'
import HiddenCardPage from '../views/HiddenCardPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import TermsPage from '../views/TermsPage.vue'
import PrivacyPage from '../views/PrivacyPage.vue'
import { validateToken } from '@/api/auth'
import { clearSession, touchSession } from '@/utils/session'
import { consumeSkipTokenValidation } from '@/utils/authSession'
import { isOversizedToken } from '@/utils/tokenGuard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/', name: 'landing', component: LandingPage },
    { path: '/hub', name: 'hub', component: HubPage },
    { path: '/xiantian', name: 'xiantian', component: XianTianPage },
    { path: '/bianqi', name: 'bianqi', component: BianQiPage },
    { path: '/qixiangtai', name: 'qixiangtai', component: QiXiangTaiPage },
    { path: '/wanqi', name: 'wanqi', component: WanQiPage },
    { path: '/hidden-card', name: 'hidden-card', component: HiddenCardPage },
    { path: '/profile', name: 'profile', component: ProfilePage },
    { path: '/terms', name: 'terms', component: TermsPage },
    { path: '/privacy', name: 'privacy', component: PrivacyPage },
    { path: '/index', redirect: '/hub' },
    { path: '/home', name: 'legacy-home', component: Home }
  ]
})

let lastValidateAt = 0
const VALIDATE_CACHE_MS = Number(import.meta.env.VITE_TOKEN_VALIDATE_CACHE_MS || 5 * 60 * 1000)

router.beforeEach(async (to) => {
  const token = localStorage.getItem('token')
  const publicRoutes = ['/login', '/register', '/', '/terms', '/privacy']
  if (!token && !publicRoutes.includes(to.path)) return '/login'
  if (token && isOversizedToken(token)) {
    clearSession()
    return '/login'
  }
  if (token && (to.path === '/login' || to.path === '/register')) return '/hub'
  if (!token) return true

  // 页面跳转本身算作用户活跃，避免在子页停留较久后点「返回中枢」被误判为空闲登出
  touchSession()

  if (consumeSkipTokenValidation()) {
    lastValidateAt = Date.now()
    return true
  }

  const now = Date.now()
  const shouldValidate = now - lastValidateAt >= VALIDATE_CACHE_MS

  if (!shouldValidate) {
    return true
  }

  try {
    await validateToken()
    lastValidateAt = Date.now()
    return true
  } catch (error) {
    const status = error?.response?.status
    // 仅 token 明确失效时才登出；网络异常 / 接口不存在不应清本地会话
    if (status === 401 || status === 403) {
      clearSession()
      return '/login'
    }
    lastValidateAt = Date.now()
    return true
  }
})

export default router
