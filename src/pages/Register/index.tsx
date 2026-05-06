import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/auth/AuthShell'
import { useAuth } from '../../context/AuthContext'
import { appRoutes } from '../../routes/paths'

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  if (user) return <Navigate to={appRoutes.dashboard} replace />

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const result = register(form)
    if (!result.ok) {
      setError(result.error)
      return
    }

    navigate(appRoutes.dashboard)
  }

  return (
    <AuthShell
      title="פותחים חשבון"
      subtitle="כמה פרטים קצרים ואתם בפנים"
      footer={
        <p className="auth-card__footer-text">
          כבר רשומים?{' '}
          <Link to={appRoutes.login} className="link">
            עברו להתחברות
          </Link>
        </p>
      }
    >
      <form className="form-stack" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span className="field__label">שם מלא</span>
            <input
              className="field__input"
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="איך השותפים יראו אתכם?"
            />
          </label>
          <label className="field">
            <span className="field__label">מספר טלפון</span>
            <input
              className="field__input"
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="050-123-4567"
            />
          </label>
          <label className="field">
            <span className="field__label">כתובת אימייל</span>
            <input
              className="field__input"
              type="email"
              dir="ltr"
              autoComplete="username"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="name@example.com"
            />
          </label>
          <label className="field">
            <span className="field__label">סיסמה</span>
            <input
              className="field__input"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="לפחות 6 תווים"
            />
            <span className="field__hint">
              החשבון יישמר רק בסשן הנוכחי לצורכי הדגמה.
            </span>
          </label>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          <button type="submit" className="btn btn--primary btn--block">
            יצירת חשבון והמשך
          </button>
      </form>
    </AuthShell>
  )
}
