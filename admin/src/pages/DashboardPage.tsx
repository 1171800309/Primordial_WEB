import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchUsers } from '../api/users'

export function DashboardPage() {
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers(1, 1)
      .then((data) => setTotal(data.total))
      .catch(() => setTotal(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="page-kicker">Overview</p>
          <h2 className="page-title">仪表盘</h2>
          <p className="page-desc">系统运行概况与快捷入口</p>
        </div>
      </header>

      <div className="stat-grid">
        <article className="stat-card">
          <p className="stat-label">注册用户</p>
          <p className="stat-value">{loading ? '—' : (total ?? '—')}</p>
          <p className="stat-hint">平台累计用户总量</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">管理模块</p>
          <p className="stat-value">1</p>
          <p className="stat-hint">用户资料与审计</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">安全策略</p>
          <p className="stat-value stat-value-text">已启用</p>
          <p className="stat-hint">RSA 加密登录 · 操作留痕</p>
        </article>
      </div>

      <div className="panel-grid">
        <article className="panel-card">
          <h3>快捷操作</h3>
          <div className="quick-actions">
            <Link to="/users" className="quick-action">
              <span>用户列表</span>
              <small>查看与管理全部用户</small>
            </Link>
          </div>
        </article>
        <article className="panel-card panel-card-muted">
          <h3>系统说明</h3>
          <ul className="info-list">
            <li>管理员账号需在数据库中标记为 admin 类型</li>
            <li>用户资料变更会自动写入审计日志</li>
            <li>头像上传支持 jpg / png / webp，最大 2MB</li>
          </ul>
        </article>
      </div>
    </section>
  )
}
