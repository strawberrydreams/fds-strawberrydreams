import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { signup as signupRequest } from '../../services/usersApi'

type AuthMode = 'login' | 'signup'

type AuthModalProps = {
  onClose: () => void
}

function AuthModal({ onClose }: AuthModalProps) {
  const { login, loading } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [notice, setNotice] = useState<string | null>(null)
  const [loginUserId, setLoginUserId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLocalError, setLoginLocalError] = useState<string | null>(null)

  const [signupUserId, setSignupUserId] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupGender, setSignupGender] = useState('')
  const [signupBirth, setSignupBirth] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupPwQuestion, setSignupPwQuestion] = useState('')
  const [signupPwAnswer, setSignupPwAnswer] = useState('')
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupLoading, setSignupLoading] = useState(false)

  const primaryInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    primaryInputRef.current?.focus()
  }, [mode])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const switchToLogin = (nextNotice?: string) => {
    setMode('login')
    setNotice(nextNotice ?? null)
    setSignupError(null)
  }

  const switchToSignup = () => {
    setMode('signup')
    setNotice(null)
    setLoginLocalError(null)
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginLocalError(null)
    setNotice(null)

    if (!loginUserId.trim() || !loginPassword.trim()) {
      setLoginLocalError('User ID and password are required.')
      return
    }

    try {
      await login(loginUserId.trim(), loginPassword)
      onClose()
    } catch (err) {
      const message =
          err instanceof Error ? err.message : 'Login failed. Try again.'
      setLoginLocalError(message)
    }
  }

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSignupError(null)

    const userIdValue = signupUserId.trim()
    const nameValue = signupName.trim()
    if (!userIdValue || !nameValue || !signupPassword.trim()) {
      setSignupError('User ID, name, and password are required.')
      return
    }

    const payload = {
      userId: userIdValue,
      name: nameValue,
      userEmail: normalizeOptional(signupEmail),
      gender: normalizeOptional(signupGender),
      birth: signupBirth ? signupBirth : null,
      userPw: signupPassword,
      pwQuestion: normalizeOptional(signupPwQuestion),
      pwAnswer: normalizeOptional(signupPwAnswer),
    }

    setSignupLoading(true)
    try {
      await signupRequest(payload)
      setSignupPassword('')
      setSignupPwQuestion('')
      setSignupPwAnswer('')
      switchToLogin('Signup completed. Please sign in.')
      setLoginUserId(userIdValue)
      setLoginPassword('')
    } catch (err) {
      const message =
          err instanceof Error ? err.message : 'Signup failed. Try again.'
      setSignupError(message)
    } finally {
      setSignupLoading(false)
    }
  }

  const loginErrorMessage = loginLocalError

  return (
      <div className="auth-modal" role="dialog" aria-modal="true">
        <div
            className="login-card auth-modal__card"
            onClick={(event) => event.stopPropagation()}
        >
          <button
              type="button"
              className="ghost auth-modal__close"
              onClick={onClose}
              aria-label="Close dialog"
          >
            X
          </button>

          {mode === 'login' ? (
              <>
                <p className="eyebrow">FDS</p>
                <h1>Sign in</h1>
                <p className="subtitle">Use your account to access stats.</p>

                <form className="login-form" onSubmit={handleLoginSubmit}>
                  <label className="control">
                    <span>User ID</span>
                    <input
                        ref={primaryInputRef}
                        type="text"
                        placeholder="your-id"
                        value={loginUserId}
                        onChange={(event) => setLoginUserId(event.target.value)}
                        autoComplete="username"
                    />
                  </label>
                  <label className="control">
                    <span>Password</span>
                    <input
                        type="password"
                        placeholder="password"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        autoComplete="current-password"
                    />
                  </label>

                  {notice ? <div className="banner">{notice}</div> : null}
                  {loginErrorMessage ? (
                      <div className="banner banner--error">{loginErrorMessage}</div>
                  ) : null}

                  <button type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>

                <div className="auth-switch">
                  <span>No account yet?</span>
                  <button type="button" className="ghost" onClick={switchToSignup}>
                    Sign up
                  </button>
                </div>
              </>
          ) : (
              <>
                <p className="eyebrow">FDS</p>
                <h1>Create account</h1>
                <p className="subtitle">
                  User ID, name, and password are required.
                </p>

                <form className="login-form" onSubmit={handleSignupSubmit}>
                  <label className="control">
                    <span>User ID</span>
                    <input
                        type="text"
                        placeholder="your-id"
                        value={signupUserId}
                        onChange={(event) => setSignupUserId(event.target.value)}
                        autoComplete="username"
                        ref={primaryInputRef}
                    />
                  </label>
                  <label className="control">
                    <span>Name</span>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={signupName}
                        onChange={(event) => setSignupName(event.target.value)}
                    />
                  </label>
                  <label className="control">
                    <span>Email (optional)</span>
                    <input
                        type="email"
                        placeholder="user@example.com"
                        value={signupEmail}
                        onChange={(event) => setSignupEmail(event.target.value)}
                        autoComplete="email"
                    />
                  </label>
                  <label className="control">
                    <span>Gender (optional)</span>
                    <input
                        type="text"
                        placeholder="Optional"
                        value={signupGender}
                        onChange={(event) => setSignupGender(event.target.value)}
                    />
                  </label>
                  <label className="control">
                    <span>Birth (optional)</span>
                    <input
                        type="date"
                        value={signupBirth}
                        onChange={(event) => setSignupBirth(event.target.value)}
                    />
                  </label>
                  <label className="control">
                    <span>Password</span>
                    <input
                        type="password"
                        placeholder="password"
                        value={signupPassword}
                        onChange={(event) => setSignupPassword(event.target.value)}
                        autoComplete="new-password"
                    />
                    <span className="hint">
                      Minimum 8 characters with uppercase, lowercase, and a number.
                    </span>
                  </label>
                  <label className="control">
                    <span>Password question (optional)</span>
                    <input
                        type="text"
                        placeholder="e.g., Favorite color?"
                        value={signupPwQuestion}
                        onChange={(event) => setSignupPwQuestion(event.target.value)}
                    />
                  </label>
                  <label className="control">
                    <span>Password answer (optional)</span>
                    <input
                        type="text"
                        placeholder="Your answer"
                        value={signupPwAnswer}
                        onChange={(event) => setSignupPwAnswer(event.target.value)}
                    />
                  </label>

                  {signupError ? (
                      <div className="banner banner--error">{signupError}</div>
                  ) : null}

                  <button type="submit" disabled={signupLoading}>
                    {signupLoading ? 'Creating...' : 'Create account'}
                  </button>
                </form>

                <div className="auth-switch">
                  <span>Already have an account?</span>
                  <button type="button" className="ghost" onClick={() => switchToLogin()}>
                    Sign in
                  </button>
                </div>
              </>
          )}
        </div>
      </div>
  )
}

const normalizeOptional = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export default AuthModal
