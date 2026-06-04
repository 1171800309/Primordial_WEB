import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { PasswordField } from '../components/PasswordField'
import { fetchAuthPublicKey } from '../utils/passwordCipher'

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  useEffect(() => {
    fetchAuthPublicKey().catch((err) => {
      console.warn('[admin] 预加载登录公钥失败', err)
    })
  }, [])

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      setPassword('')
      navigate(redirectTo, { replace: true })
    } catch (e) {
      setPassword('')
      setError(e instanceof Error ? e.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await handleLogin()
  }

  return (
    <div className="login-page">
      <div className="login-glow login-glow-a" aria-hidden="true" />
      <div className="login-glow login-glow-b" aria-hidden="true" />

      <div className="login-shell">
        <aside className="login-brand">
          <div className="login-brand-inner">
            <div className="login-logo-wrap">
              <img src="/favicon.svg" alt="" className="login-logo" />
            </div>
            <p className="login-brand-kicker">PRIMORDIAL ADMIN</p>
            <h1 className="login-brand-title">一炁文化管理中枢</h1>
          </div>
        </aside>

        <main className="login-panel">
          <div className="login-panel-inner">
            <header className="login-header">
              <h2>欢迎回来</h2>
            </header>

            <form className="login-form" onSubmit={onSubmit} autoComplete="on">
              <label className="login-field" htmlFor="username">
                <span className="login-field-label">用户名</span>
                <div className="login-input-wrap">
                  <span className="login-input-icon">
                    <UserIcon />
                  </span>
                  <input
                    id="username"
                    name="username"
                    className="login-input"
                    value={username}
                    autoComplete="username"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    disabled={loading}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="管理员用户名"
                  />
                </div>
              </label>

              <label className="login-field" htmlFor="password">
                <span className="login-field-label">密码</span>
                <div className="login-input-wrap">
                  <span className="login-input-icon">
                    <LockIcon />
                  </span>
                  <PasswordField
                    value={password}
                    disabled={loading}
                    placeholder="登录密码"
                    onChange={setPassword}
                    onEnter={() => void handleLogin()}
                  />
                </div>
              </label>

              {error ? (
                <div className="login-alert" role="alert">
                  {error}
                </div>
              ) : null}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="login-spinner" aria-hidden="true" />
                    登录中…
                  </>
                ) : (
                  '进入后台'
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
