import { apiRequest } from './client'

export type ShopOrderItem = {
  id: number
  userId: number
  username?: string | null
  productSku: string
  productName: string
  amountYuan: number
  status: string
  statusLabel: string
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  paymentMethod?: string | null
  paidAt?: string | null
  trackingCompany?: string | null
  trackingNo?: string | null
  shippedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type ShopOrderListResult = {
  total: number
  page: number
  pageSize: number
  items: ShopOrderItem[]
}

export async function fetchOrders(page = 1, pageSize = 20, status?: string) {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (status) query.set('status', status)
  return apiRequest<ShopOrderListResult>(`/shop/orders?${query}`)
}

export async function shipOrder(id: number, trackingCompany: string, trackingNo: string) {
  return apiRequest(`/shop/orders/${id}/ship`, {
    method: 'POST',
    body: JSON.stringify({ trackingCompany, trackingNo }),
  })
}

export async function completeOrder(id: number) {
  return apiRequest(`/shop/orders/${id}/complete`, { method: 'POST' })
}
