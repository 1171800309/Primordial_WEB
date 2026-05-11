import request from './request'

export const getProvinces = () => {
  return request({
    url: '/api/Region/provinces',
    method: 'get'
  })
}

export const getCities = (province) => {
  return request({
    url: '/api/Region/cities',
    method: 'get',
    params: { province }
  })
}

export const getDistricts = (province, city) => {
  return request({
    url: '/api/Region/districts',
    method: 'get',
    params: { province, city }
  })
}

/**
 * GET /api/Region/hour-pillar
 * @param {object} params
 * @param {string} params.province
 * @param {string} params.city
 * @param {string} params.coordinates 区县接口返回的完整 coordinates
 * @param {string} params.birthTime 出生时间（与原先一致，如 HH:mm:ss）
 * @param {string} [params.calendarType] 不传或 solar=阳历；农历传 lunar
 * @param {string} [params.birthDate] 阳历必填 yyyy-MM-dd
 * @param {string} [params.birthYear] 农历必填
 * @param {string} [params.lunarMonth] 农历必填（中文等，axios 会编码）
 * @param {string} [params.lunarDay] 农历必填
 */
export const getHourPillar = (params) => {
  return request({
    url: '/api/Region/hour-pillar',
    method: 'get',
    params
  })
}

