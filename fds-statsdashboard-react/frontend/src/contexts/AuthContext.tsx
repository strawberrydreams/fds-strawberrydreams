import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser } from '../types/auth'
import {
  login as loginRequest,
  logout as logoutRequest,
  refresh as refreshRequest,
} from '../services/authApi'
import { clearAuth, loadAuth, saveAuth } from '../utils/authStorage'

export type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (userId: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const isCsrfError = (err: unknown) =>
    err instanceof Error && err.name === 'CsrfError'

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadAuth()
  const [token, setToken] = useState<string | null>(stored?.token ?? null)
  const [user, setUser] = useState<AuthUser | null>(stored?.user ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refreshAttempted = useRef(false)

  const refreshSession = useCallback(async () => {
    const response = await refreshRequest()
    const nextUser: AuthUser = {
      userId: response.userId ?? null,
      loginId: response.loginId,
      role: response.role,
    }
    setToken(response.accessToken)
    setUser(nextUser)
    saveAuth({ token: response.accessToken, user: nextUser })
    setError(null)
  }, [])

  const login = useCallback(async (userId: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await loginRequest({ userId, password })
      const nextUser: AuthUser = {
        userId: response.userId ?? null,
        loginId: response.loginId,
        role: response.role,
      }
      setToken(response.accessToken)
      setUser(nextUser)
      saveAuth({ token: response.accessToken, user: nextUser })
    } catch (err) {
      const message =
          err instanceof Error ? err.message : 'Login failed. Try again.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
      setError(null)
    } catch (err) {
      const message =
          err instanceof Error ? err.message : 'Logout failed. Try again.'
      setError(message)
    } finally {
      // Clear local auth even if the server logout fails.
      clearAuth()
      setToken(null)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (refreshAttempted.current) {
      return
    }
    refreshAttempted.current = true
    refreshSession().catch((err) => {
      if (isCsrfError(err)) {
        const message =
            err instanceof Error ? err.message : 'CSRF token fetch failed.'
        setError(message)
      }
      // Refresh failures should not block the login screen.
    })
  }, [refreshSession])

  const value = useMemo(
      () => ({
        token,
        user,
        loading,
        error,
        login,
        logout,
      }),
      [token, user, loading, error, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
