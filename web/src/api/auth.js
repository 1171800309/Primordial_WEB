import request from './request'
import { encryptPassword } from '@/utils/passwordCipher'

const withEncryptedPassword = async (data) => ({
  ...data,
  password: data?.password ? await encryptPassword(data.password) : data?.password
})

export const register = async (data) => {
  return request({
    url: '/api/Auth/register',
    method: 'post',
    data: await withEncryptedPassword(data)
  })
}

export const login = async (data) => {
  return request({
    url: '/api/Auth/login',
    method: 'post',
    data: await withEncryptedPassword(data)
  })
}

export const getUserInfo = () => {
  return request({
    url: '/api/Auth/userinfo',
    method: 'get'
  })
}

/** 路由守卫用：静默校验 token，失败时不弹 toast、不强制跳登录页 */
export const validateToken = () => {
  return request({
    url: import.meta.env.VITE_TOKEN_VALIDATE_PATH || '/api/Auth/userinfo',
    method: 'get',
    skipAuthRedirect: true,
    skipErrorMessage: true
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