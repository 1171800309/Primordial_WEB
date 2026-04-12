import request from './request'

export const register = (data) => {
  return request({
    url: '/api/Auth/register',
    method: 'post',
    data
  })
}

export const login = (data) => {
  return request({
    url: '/api/Auth/login',
    method: 'post',
    data
  })
}

export const getUserInfo = () => {
  return request({
    url: '/api/Auth/userinfo',
    method: 'get'
  })
}

export const validateToken = () => {
  return request({
    url: import.meta.env.VITE_TOKEN_VALIDATE_PATH || '/api/Auth/validate',
    method: 'get'
  })
}

export const getUsers = () => {
  return request({
    url: '/api/Auth/users',
    method: 'get'
  })
}

export const logout = () => {
  return request({
    url: '/api/Auth/logout',
    method: 'post'
  })
}