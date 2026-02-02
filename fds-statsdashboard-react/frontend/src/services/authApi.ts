import type { LoginRequest, LoginResponse } from '../types/auth'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN'
const CSRF_ERROR_NAME = 'CsrfError'

const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') {
    return null
  }
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  const match = document.cookie.match(
      new RegExp(`(?:^|; )${escaped}=([^;]*)`),
  )
  return match ? decodeURIComponent(match[1]) : null
}

const ensureCsrfToken = async (): Promise<string> => {
  const existing = getCookieValue(CSRF_COOKIE_NAME)
  if (existing) {
    return existing
  }
  let response: Response
  try {
    response = await fetch(`${API_BASE}/api/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
    })
  } catch {
    const error = new Error('CSRF token fetch failed.')
    error.name = CSRF_ERROR_NAME
    throw error
  }
  if (!response.ok) {
    const message = await response.text()
    const error = new Error(
        message || `CSRF token fetch failed (${response.status})`,
    )
    error.name = CSRF_ERROR_NAME
    throw error
  }
  const token = getCookieValue(CSRF_COOKIE_NAME)
  if (!token) {
    const error = new Error('CSRF token cookie is missing.')
    error.name = CSRF_ERROR_NAME
    throw error
  }
  return token
}

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Login failed (${response.status})`)
  }

  return (await response.json()) as LoginResponse
}

export const refresh = async (): Promise<LoginResponse> => {
  const csrfToken = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { [CSRF_HEADER_NAME]: csrfToken },
    credentials: 'include',
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Refresh failed (${response.status})`)
  }

  return (await response.json()) as LoginResponse
}

export const logout = async (): Promise<void> => {
  const csrfToken = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    headers: { [CSRF_HEADER_NAME]: csrfToken },
    credentials: 'include',
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Logout failed (${response.status})`)
  }
}
