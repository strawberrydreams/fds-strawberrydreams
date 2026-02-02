export type LoginRequest = {
  userId: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
  userId: number | null
  loginId: string
  role: string
}

export type AuthUser = {
  userId: number | null
  loginId: string
  role: string
}
