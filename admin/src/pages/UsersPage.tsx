import { useEffect, useState } from 'react'
import { fetchUsers, type UserListItem } from '../api/users'

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
    <section>
      <h1>用户管理</h1>
      <p>共 {total} 条（手机号/邮箱已脱敏）</p>
      {loading ? <p>加载中…</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && !error ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>手机</th>
              <th>类型</th>
              <th>状态</th>
              <th>注册时间</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.username}</td>
                <td>{row.phone ?? '-'}</td>
                <td>{row.userType}</td>
                <td>{row.status === 1 ? '正常' : '禁用'}</td>
                <td>{new Date(row.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  )
}
