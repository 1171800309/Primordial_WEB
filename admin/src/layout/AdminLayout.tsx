import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 19c0-3.314 2.686-6 6-6s6 2.686 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 7.5a2.5 2.5 0 1 1 0 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M19 19c0-2.5-1.5-4.5-4-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LogIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/favicon.svg" alt="" className="sidebar-logo" />
          <div>
            <strong>Primordial</strong>
            <span>Admin Console</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className="sidebar-link">
            <DashboardIcon />
            <span>仪表盘</span>
          </NavLink>
          <NavLink to="/users" className="sidebar-link">
            <UsersIcon />
            <span>用户管理</span>
          </NavLink>
          <NavLink to="/orders" className="sidebar-link">
            <UsersIcon />
            <span>盲盒订单</span>
          </NavLink>
          <NavLink to="/audit-logs" className="sidebar-link">
            <LogIcon />
            <span>操作日志</span>
          </NavLink>
        </nav>
        <div className="sidebar-foot">
          <p>一炁文化 · 管理中枢</p>
        </div>
      </aside>
      <div className="main">
        <header className="header">
          <div className="header-left">
            <p className="header-kicker">管理后台</p>
            <h1 className="header-title">运营控制台</h1>
          </div>
          <div className="header-right">
            <div className="user-chip">
              <span className="user-chip-avatar">
                {(user?.username ?? '?').slice(0, 1).toUpperCase()}
              </span>
              <div>
                <strong>{user?.username ?? '-'}</strong>
                <span>{user?.role ?? 'admin'}</span>
              </div>
            </div>
            <button className="ghost-btn" onClick={() => void logout()} type="button">
              退出登录
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
