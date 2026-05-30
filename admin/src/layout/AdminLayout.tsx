import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Primordial Admin</h2>
        <nav>
          <NavLink to="/" end>
            仪表盘
          </NavLink>
          <NavLink to="/users">用户管理</NavLink>
        </nav>
      </aside>
      <div className="main">
        <header className="header">
          <p>
            当前管理员：{user?.username ?? '-'}（{user?.role ?? '-'}）
          </p>
          <button onClick={() => void logout()} type="button">
            退出登录
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
