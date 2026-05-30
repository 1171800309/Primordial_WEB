import { fetchMyHenqi } from '@/api/me'

const unwrapHenqiNumber = (res) => {
  const data = res?.data ?? res
  const value = data?.xianTianHengQi
  return typeof value === 'number' ? value : Number(value)
}

/** 通过 token 从 /api/me/henqi 获取先天恒炁数 */
export async function resolveXianTianHenqiNumber() {
  const res = await fetchMyHenqi()
  const num = unwrapHenqiNumber(res)
  if (!Number.isFinite(num)) {
    throw new Error('后端未返回有效的先天恒炁数')
  }
  return num
}
