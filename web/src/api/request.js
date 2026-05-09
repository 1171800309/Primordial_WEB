import axios from 'axios'
import { ElMessage } from 'element-plus'
import { isSessionIdleExpired, touchSession, clearSession, getIdleTimeoutMs } from '@/utils/session'

const baseURL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : ''

const request = axios.create({
  baseURL,
  timeout: 15000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    const isLoginReq = String(config.url || '').includes('/api/Auth/login')

    if (!isLoginReq && token && isSessionIdleExpired()) {
      clearSession()
      return Promise.reject(
        new Error(`登录超时（超过${Math.floor(getIdleTimeoutMs() / 60000)}分钟未操作），请重新登录`)
      )
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      touchSession()
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 兼容常见返回结构: { code, message }, { success, msg }, 以及直接返回业务对象
    if (typeof res === 'object' && res !== null) {
      const hasCode = Object.prototype.hasOwnProperty.call(res, 'code')
      const hasSuccess = Object.prototype.hasOwnProperty.call(res, 'success')
      const okByCode = !hasCode || Number(res.code) === 200
      const okBySuccess = !hasSuccess || Boolean(res.success) === true

      if (!okByCode || !okBySuccess) {
        const msg = res.message || res.msg || '请求失败'
        return Promise.reject(new Error(msg))
      }
    }
    return res
  },
  (error) => {
    if (error?.response?.status === 401) {
      clearSession()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    const serverMsg =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      error?.response?.data?.error ||
      error.message ||
      '网络错误'
    ElMessage.error(serverMsg)
    return Promise.reject(error)
  }
)

export default request