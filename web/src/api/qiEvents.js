import request from './request'

/** 炁象台 · 河录事件 */
export const fetchMyQiEvents = () =>
  request({
    url: '/api/me/qi-events',
    method: 'get'
  })

export const createMyQiEvent = (payload) =>
  request({
    url: '/api/me/qi-events',
    method: 'post',
    data: payload
  })

export const deleteMyQiEvent = (id) =>
  request({
    url: `/api/me/qi-events/${id}`,
    method: 'delete'
  })

/** 标记先天词卡已开启 */
export const openMyTraitCard = (slotId) =>
  request({
    url: `/api/me/trait-cards/${slotId}/open`,
    method: 'post'
  })
