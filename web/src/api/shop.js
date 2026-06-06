import request from './request'

export const fetchShopProducts = () =>
  request({ url: '/api/me/shop/orders/products', method: 'get' })

export const fetchMyOrders = () =>
  request({ url: '/api/me/shop/orders', method: 'get' })

export const createShopOrder = (data) =>
  request({ url: '/api/me/shop/orders', method: 'post', data })

export const payShopOrder = (id, paymentMethod = 'mock_online') =>
  request({ url: `/api/me/shop/orders/${id}/pay`, method: 'post', data: { paymentMethod } })
