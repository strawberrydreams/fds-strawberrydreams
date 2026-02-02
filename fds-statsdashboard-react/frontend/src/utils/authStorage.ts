import type { AuthUser } from '../types/auth'

const STORAGE_KEY = 'fds_auth'

export type StoredAuth = {
  token: string
  user: AuthUser
}

export const loadAuth = (): StoredAuth | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as StoredAuth & {
      user?: { loginId?: string; email?: string }
    }
    if (!parsed?.token) {
      return null
    }
    if (parsed.user && !parsed.user.loginId && parsed.user.email) {
      parsed.user.loginId = parsed.user.email
    }
    return parsed
  } catch {
    return null
  }
}

export const saveAuth = (auth: StoredAuth) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export const clearAuth = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
}

export const getAuthToken = () => loadAuth()?.token ?? null
