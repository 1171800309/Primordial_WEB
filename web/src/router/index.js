import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Register from '../views/Register.vue'
import { validateToken } from '@/api/auth'
import { clearSession, isSessionIdleExpired, touchSession } from '@/utils/session'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/', redirect: '/index' },
    { path: '/index', name: 'index', component: Home }
  ]
})

let lastValidateAt = 0
const VALIDATE_CACHE_MS = Number(import.meta.env.VITE_TOKEN_VALIDATE_CACHE_MS || 30 * 1000)

router.beforeEach(async (to) => {
  const token = localStorage.getItem('token')
  const publicRoutes = ['/login', '/register']
  if (!token && !publicRoutes.includes(to.path)) return '/login'
  if (token && (to.path === '/login' || to.path === '/register')) return '/index'
  if (!token) return true

  if (isSessionIdleExpired()) {
    clearSession()
    return '/login'
  }

  const now = Date.now()
  const shouldValidate = now - lastValidateAt >= VALIDATE_CACHE_MS

  if (!shouldValidate) {
    touchSession()
    return true
  }

  try {
    await validateToken()
    lastValidateAt = Date.now()
    touchSession()
    return true
  } catch (error) {
    clearSession()
    return '/login'
  }
})

export default router