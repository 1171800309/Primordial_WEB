import { apiRequest } from './client'

export type UserListItem = {
  id: number
  username: string
  phone: string | null
  email: string | null
  status: number
  userType: string
  createdAt: string
  updatedAt: string
}

export type UserListResult = {
  total: number
  page: number
  pageSize: number
  items: UserListItem[]
}

export function fetchUsers(page = 1, pageSize = 20) {
  return apiRequest<UserListResult>(
    `/api/admin/users?page=${page}&pageSize=${pageSize}`
  )
}
