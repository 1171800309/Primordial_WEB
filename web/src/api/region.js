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

export const getHourPillar = (province, city, coordinates, birthTime) => {
  return request({
    url: '/api/Region/hour-pillar',
    method: 'get',
    params: { province, city, coordinates, birthTime }
  })
}

