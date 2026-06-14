import { apiRequest } from './client'

export type OperationLogItem = {
  id: number
  actionType: string
  moduleName: string
  operatorId: number | null
  operatorName: string
  operatorRole: string
  targetType: string | null
  targetId: number | null
  requestIp: string | null
  requestPath: string | null
  operationContent: string
  createdAt: string
}

export type OperationLogListResult = {
  total: number
  page: number
  pageSize: number
  items: OperationLogItem[]
}

export type OperationLogFilters = {
  keyword?: string
  startTime?: string
  endTime?: string
}

export function fetchOperationLogs(
  page = 1,
  pageSize = 20,
  filters: OperationLogFilters = {}
) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (filters.keyword?.trim()) query.set('keyword', filters.keyword.trim())
  if (filters.startTime?.trim()) query.set('startTime', filters.startTime.trim())
  if (filters.endTime?.trim()) query.set('endTime', filters.endTime.trim())

  return apiRequest<OperationLogListResult>(`/operation-logs?${query.toString()}`)
}
