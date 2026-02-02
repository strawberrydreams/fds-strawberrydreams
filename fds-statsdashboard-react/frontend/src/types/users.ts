export type UserSignupRequest = {
  userId: string
  name: string
  userEmail: string | null
  birth: string | null
  gender: string | null
  userPw: string
  pwQuestion: string | null
  pwAnswer: string | null
}

export type UserSignupResponse = {
  userId: number
}
