import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'

function LoginPage() {
  const { login, loading, error } = useAuth()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)

    if (!userId.trim() || !password.trim()) {
      setLocalError('User ID and password are required.')
      return
    }

    try {
      await login(userId.trim(), password)
    } catch {
      // Error is surfaced from the auth context.
    }
  }

  return (
      <div className="login-page">
        <div className="login-card">
          <p className="eyebrow">FDS</p>
          <h1>Sign in</h1>
          <p className="subtitle">Use your account to access stats.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="control">
              <span>User ID</span>
              <input
                  type="text"
                  placeholder="your-id"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  autoComplete="username"
              />
            </label>
            <label className="control">
              <span>Password</span>
              <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
              />
            </label>

            {localError || error ? (
                <div className="banner banner--error">{localError || error}</div>
            ) : null}

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="hint">
            Admin-only actions require an ADMIN role in the server config.
          </p>
        </div>
      </div>
  )
}

export default LoginPage
