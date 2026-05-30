import request from './request'

/** 当前登录用户的八字分析（token 鉴权，数据在响应体） */
export const fetchMyBazi = () =>
  request({
    url: '/api/me/bazi',
    method: 'get'
  })

/** 当前登录用户的先天恒炁数 */
export const fetchMyHenqi = () =>
  request({
    url: '/api/me/henqi',
    method: 'get'
  })

/** 当前登录用户的天干太玄数据 */
export const fetchMyTianGanTaiXuan = () =>
  request({
    url: '/api/me/tiangan-taixuan',
    method: 'get'
  })

/** 当前登录用户的先天特性词卡（10 张，按八字键查词库） */
export const fetchMyTraitCards = () =>
  request({
    url: '/api/me/trait-cards',
    method: 'get'
  })

/** 当前登录用户的先天显性/隐性八维雷达图（实时计算，不存库） */
export const fetchMyRadarCharts = () =>
  request({
    url: '/api/me/radar-charts',
    method: 'get'
  })

/** 当前登录用户的后天变炁（大运/流年 BUFF + 能量场词条） */
export const fetchMyBianQi = (year) =>
  request({
    url: '/api/me/bianqi',
    method: 'get',
    params: year ? { year } : undefined
  })
