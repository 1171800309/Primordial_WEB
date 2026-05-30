import { apiRequest } from './client'

export type AdminUser = {
  id: number
  username: string
  role: string
}

export type LoginResult = {
  token: string
  user: AdminUser
}

export function login(username: string, password: string) {
  return apiRequest<LoginResult>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function fetchCurrentAdmin() {
  return apiRequest<AdminUser>('/api/admin/auth/me')
}

export function logout() {
  return apiRequest<{ message?: string }>('/api/admin/auth/logout', {
    method: 'POST',
  })
}
