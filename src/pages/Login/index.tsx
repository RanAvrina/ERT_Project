import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/auth/AuthShell'
import { useAuth } from '../../context/AuthContext'
import { mockUsers } from '../../data/mock'
import { appRoutes } from '../../routes/paths'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('ran@example.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to={appRoutes.dashboard} replace />

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const result = login({ email, password })
    if (!result.ok) {
      setError(result.error)
      return
    }

    navigate(appRoutes.dashboard)
  }

  return (
    <AuthShell
      title="ברוכים הבאים"
      subtitle="התחברו כדי לחזור לדירה שלכם"
      hideIntro
      footer={
        <p className="auth-card__footer-text">
          אין לך חשבון?{' '}
          <Link to={appRoutes.register} className="link">
            פתחו חשבון חדש
          </Link>
          <span className="auth-card__footer-divider">·</span>
          <Link to={appRoutes.createApartment} className="link">
            פתיחת דירה חדשה
          </Link>
        </p>
      }
    >
      <form className="form-stack" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span className="field__label">כתובת אימייל</span>
            <input
              className="field__input"
              type="email"
              autoComplete="username"
              dir="ltr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
            <span className="field__hint">אפשר לבחור חשבון דמו מהרשימה למטה.</span>
          </label>
          <label className="field">
            <span className="field__label">סיסמה</span>
            <input
              className="field__input"
              type="password"
              autoComplete="current-password"
              dir="ltr"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="כל סיסמה תעבוד בדמו"
            />
          </label>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          <button type="submit" className="btn btn--primary btn--block">
            כניסה לחשבון
          </button>
      </form>

      <div className="auth-card__demo">
        <p className="auth-card__demo-title">כניסה מהירה בדמו</p>
        <ul className="auth-card__demo-list">
          {mockUsers.map((demoUser) => (
            <li key={demoUser.id}>
              <button
                type="button"
                className="auth-card__demo-item"
                onClick={() => {
                  setEmail(demoUser.email)
                  setError('')
                }}
              >
                <span>{demoUser.name}</span>
                <span dir="ltr">{demoUser.email}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AuthShell>
  )
}
