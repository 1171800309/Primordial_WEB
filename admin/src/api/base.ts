/** 管理端 API 根路径：空则走 Vite/nginx 相对路径 /auth、/users */
export function getAdminApiBase(): string {
  const raw = import.meta.env.VITE_ADMIN_API_URL ?? ''
  return typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
}

export function adminApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = getAdminApiBase()
  return base ? `${base}${normalized}` : normalized
}
