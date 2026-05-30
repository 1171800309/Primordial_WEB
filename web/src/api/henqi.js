import request from './request'
import { fetchMyHenqi } from '@/api/me'

export { fetchMyHenqi }

/** 通用恒炁计算（需自行组装四柱/长生/身旺身弱） */
export const computeHenqi = (data) =>
  request({
    url: '/api/henqi/compute',
    method: 'post',
    data
  })
