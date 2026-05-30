import { apiRequest } from './client'
import { encryptPassword } from '../utils/passwordCipher'

export type AdminUser = {
  id: number
  username: string
  role: string
}

export type LoginResult = {
  token: string
  user: AdminUser
}

export async function login(username: string, password: string) {
  const encryptedPassword = await encryptPassword(password)
  return apiRequest<LoginResult>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password: encryptedPassword }),
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
