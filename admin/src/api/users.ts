import { apiRequest } from './client'

export type UserListItem = {
  id: number
  username: string
  phone: string | null
  email: string | null
  status: number
  userType: string
  nickname?: string | null
  avatar?: string | null
  createdAt: string
  updatedAt: string
}

export type UserListResult = {
  total: number
  page: number
  pageSize: number
  items: UserListItem[]
}

export type UserProfile = {
  nickname: string | null
  avatar: string | null
  gender: string | null
  bio: string | null
  birthday: string | null
  points: number
  balance: number
}

export type UserDetail = {
  id: number
  username: string
  phone: string | null
  email: string | null
  status: number
  userType: string
  createdAt: string
  updatedAt: string
  profile: UserProfile | null
}

export type UpdateUserPayload = {
  username?: string | null
  email?: string | null
  phone?: string | null
  status?: number
  nickname?: string | null
  gender?: string | null
  bio?: string | null
}

export type AuditLogItem = {
  id: number
  action: string
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  adminUsername: string
  remark: string | null
  createdAt: string
}

export type AuditLogResult = {
  total: number
  page: number
  pageSize: number
  items: AuditLogItem[]
}

export function fetchUsers(page = 1, pageSize = 20) {
  return apiRequest<UserListResult>(`/users?page=${page}&pageSize=${pageSize}`)
}

export function fetchUserDetail(id: number) {
  return apiRequest<UserDetail>(`/users/${id}`)
}

export function updateUser(id: number, payload: UpdateUserPayload) {
  return apiRequest<{ message?: string }>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function uploadUserAvatar(id: number, file: File) {
  const form = new FormData()
  form.append('file', file)
  return apiRequest<{ avatar: string }>(`/users/${id}/avatar`, {
    method: 'POST',
    body: form,
  })
}

export function fetchUserLogs(id: number, page = 1, pageSize = 20) {
  return apiRequest<AuditLogResult>(`/users/${id}/logs?page=${page}&pageSize=${pageSize}`)
}

export function avatarUrl(path: string | null | undefined) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return path
}
