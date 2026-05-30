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
  return apiRequest<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password: encryptedPassword }),
  })
}

export function fetchCurrentAdmin() {
  return apiRequest<AdminUser>('/auth/me')
}

export function logout() {
  return apiRequest<{ message?: string }>('/auth/logout', {
    method: 'POST',
  })
}
