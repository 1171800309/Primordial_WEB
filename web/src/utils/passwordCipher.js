const ENCRYPTED_PREFIX = 'ENC:'
const PUBLIC_KEY_PATH = '/api/Auth/public-key'

let cachedPublicKeyPem = null

const unwrapPayload = (res) => {
  if (res?.data?.publicKey) return res.data
  if (res?.publicKey) return res
  return null
}

const pemToSpkiBuffer = (pem) => {
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

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/** 拉取服务端 RSA 公钥（带内存缓存） */
export async function fetchAuthPublicKey(forceRefresh = false) {
  if (cachedPublicKeyPem && !forceRefresh) {
    return cachedPublicKeyPem
  }

  const envKey = import.meta.env.VITE_AUTH_PUBLIC_KEY_PEM
  if (envKey && !forceRefresh) {
    cachedPublicKeyPem = envKey
    return cachedPublicKeyPem
  }

  const response = await fetch(PUBLIC_KEY_PATH, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  })

  if (!response.ok) {
    throw new Error('无法获取登录加密公钥，请稍后重试')
  }

  const json = await response.json()
  const payload = unwrapPayload(json)
  if (!payload?.publicKey) {
    throw new Error('登录加密公钥格式无效')
  }

  cachedPublicKeyPem = payload.publicKey
  return cachedPublicKeyPem
}

/** RSA-OAEP(SHA-256) 加密密码，返回 ENC:Base64 格式 */
export async function encryptPassword(plainPassword) {
  if (!plainPassword) return plainPassword

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
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, cryptoKey, plainBytes)

  return `${ENCRYPTED_PREFIX}${arrayBufferToBase64(cipherBuffer)}`
}

export function clearAuthPublicKeyCache() {
  cachedPublicKeyPem = null
}
