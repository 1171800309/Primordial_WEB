import { fetchMyBazi } from '@/api/me'
import { persistBaziAnalysis, readStoredBaziAnalysis } from '@/utils/baziAnalysis'

let inflight = null

const unwrapBazi = (res) => res?.data?.baziAnalysis ?? res?.baziAnalysis ?? null

/**
 * 通过 token 拉取八字并写入本地缓存；优先读缓存，force 时跳过缓存。
 */
export async function ensureBaziAnalysis({ force = false } = {}) {
  if (!force) {
    const cached = readStoredBaziAnalysis()
    if (cached != null) return cached
  }

  if (!inflight) {
    inflight = fetchMyBazi()
      .then((res) => {
        const bazi = unwrapBazi(res)
        if (bazi != null) persistBaziAnalysis(bazi)
        return bazi
      })
      .finally(() => {
        inflight = null
      })
  }

  return inflight
}

export function clearBaziCache() {
  localStorage.removeItem('baziAnalysis')
  localStorage.removeItem('fateAnalysis')
}
