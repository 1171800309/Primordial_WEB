import { adminApiUrl } from '../api/base'

const ENCRYPTED_PREFIX = 'ENC:'
const PUBLIC_KEY_PATH = '/auth/public-key'

let cachedPublicKeyPem: string | null = null

const unwrapPayload = (json: Record<string, unknown>) => {
  const data = json.data as Record<string, unknown> | undefined
  if (data?.publicKey) return data
  if (json.publicKey) return json
  return null
}

const pemToSpkiBuffer = (pem: string) => {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s/g, '')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function clearAuthPublicKeyCache() {
  cachedPublicKeyPem = null
}

export async function fetchAuthPublicKey(forceRefresh = false) {
  if (cachedPublicKeyPem && !forceRefresh) {
    return cachedPublicKeyPem
  }

  const envKey = import.meta.env.VITE_AUTH_PUBLIC_KEY_PEM
  if (envKey && typeof envKey === 'string' && !forceRefresh) {
    cachedPublicKeyPem = envKey
    return cachedPublicKeyPem
  }

  const response = await fetch(adminApiUrl(PUBLIC_KEY_PATH), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('无法获取登录加密公钥，请稍后重试')
  }

  const json = (await response.json()) as Record<string, unknown>
  const payload = unwrapPayload(json)
  if (!payload?.publicKey || typeof payload.publicKey !== 'string') {
    throw new Error('登录加密公钥格式无效')
  }

  cachedPublicKeyPem = payload.publicKey
  return cachedPublicKeyPem
}

/** RSA-OAEP(SHA-256)，与前台一致，提交 ENC:Base64 */
export async function encryptPassword(plainPassword: string) {
  if (!plainPassword) return plainPassword

  if (!window.crypto?.subtle) {
    throw new Error('当前环境不支持密码加密，请使用 HTTPS 或 localhost 访问管理后台')
  }

  const publicKeyPem = await fetchAuthPublicKey()
  const spki = pemToSpkiBuffer(publicKeyPem)

  const cryptoKey = await crypto.subtle.importKey(
    'spki',
    spki,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  )

  const plainBytes = new TextEncoder().encode(plainPassword)
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    cryptoKey,
    plainBytes
  )

  return `${ENCRYPTED_PREFIX}${arrayBufferToBase64(cipherBuffer)}`
}
