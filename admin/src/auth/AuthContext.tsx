import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchCurrentAdmin,
  login as loginApi,
  logout as logoutApi,
  type AdminUser,
} from '../api/auth'

type AuthContextValue = {
  token: string | null
  user: AdminUser | null
  isAuthenticated: boolean
  bootstrapping: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'admin_access_token'
const USER_KEY = 'admin_current_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)

    if (!savedToken) {
      setBootstrapping(false)
      return
    }

    setToken(savedToken)
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as AdminUser)
      } catch {
        localStorage.removeItem(USER_KEY)
      }
    }

    fetchCurrentAdmin()
      .then((me) => {
        setUser(me)
        localStorage.setItem(USER_KEY, JSON.stringify(me))
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setBootstrapping(false))
  }, [])

  const login = async (username: string, password: string) => {
    if (!username.trim() || !password.trim()) {
      throw new Error('请输入用户名和密码')
    }

    const result = await loginApi(username.trim(), password)
    localStorage.setItem(TOKEN_KEY, result.token)
    localStorage.setItem(USER_KEY, JSON.stringify(result.user))
    setToken(result.token)
    setUser(result.user)
  }

  const logout = async () => {
    try {
      if (localStorage.getItem(TOKEN_KEY)) {
        await logoutApi()
      }
    } catch {
      // 无状态 JWT，本地清理即可
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setToken(null)
      setUser(null)
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      bootstrapping,
      login,
      logout,
    }),
    [token, user, bootstrapping]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
