import type { UserSignupRequest, UserSignupResponse } from '../types/users'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export const signup = async (
    payload: UserSignupRequest,
): Promise<UserSignupResponse> => {
  const response = await fetch(`${API_BASE}/api/users/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Signup failed (${response.status})`)
  }

  return (await response.json()) as UserSignupResponse
}
