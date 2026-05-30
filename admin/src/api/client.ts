export type ApiEnvelope<T> = {
  code: number
  message?: string
  data?: T
}

const API_BASE = import.meta.env.VITE_ADMIN_API_URL ?? ''

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('admin_access_token')
  const headers = new Headers(options.headers)
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  if (!headers.has('Content-Type') && options.body && !isFormData) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  let payload: ApiEnvelope<T>
  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new Error('服务响应异常')
  }

  if (payload.code !== 200) {
    throw new Error(payload.message ?? '请求失败')
  }

  return payload.data as T
}
