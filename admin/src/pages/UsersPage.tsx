import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { avatarUrl, fetchUsers, type UserListItem } from '../api/users'

function StatusBadge({ status }: { status: number }) {
  return (
    <span className={`badge ${status === 1 ? 'badge-success' : 'badge-danger'}`}>
      {status === 1 ? '正常' : '禁用'}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  const isAdmin = type.toLowerCase() === 'admin'
  return (
    <span className={`badge ${isAdmin ? 'badge-accent' : 'badge-neutral'}`}>
      {type}
    </span>
  )
}

export function UsersPage() {
  const [items, setItems] = useState<UserListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    fetchUsers(1, 20)
      .then((data) => {
        if (cancelled) return
        setItems(data.items)
        setTotal(data.total)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '加载失败')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="page-kicker">Users</p>
          <h2 className="page-title">用户管理</h2>
          <p className="page-desc">共 {total} 位用户 · 点击用户名或「编辑」进入资料页</p>
        </div>
      </header>

      <div className="panel-card table-panel">
        {loading ? (
          <div className="empty-state">加载中…</div>
        ) : error ? (
          <div className="empty-state error-text">{error}</div>
        ) : items.length === 0 ? (
          <div className="empty-state">暂无用户数据</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户</th>
                  <th>手机</th>
                  <th>邮箱</th>
                  <th>类型</th>
                  <th>状态</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const avatar = avatarUrl(row.avatar)
                  return (
                    <tr key={row.id}>
                      <td className="mono">{row.id}</td>
                      <td>
                        <Link to={`/users/${row.id}`} className="user-cell">
                          <span className="user-cell-avatar">
                            {avatar ? (
                              <img src={avatar} alt="" />
                            ) : (
                              row.username.slice(0, 1).toUpperCase()
                            )}
                          </span>
                          <span className="user-cell-meta">
                            <strong>{row.username}</strong>
                            <small>{row.nickname ?? '未设置昵称'}</small>
                          </span>
                        </Link>
                      </td>
                      <td>{row.phone ?? '—'}</td>
                      <td>{row.email ?? '—'}</td>
                      <td>
                        <TypeBadge type={row.userType} />
                      </td>
                      <td>
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="nowrap">{new Date(row.createdAt).toLocaleString()}</td>
                      <td>
                        <Link to={`/users/${row.id}`} className="text-link">
                          编辑
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
