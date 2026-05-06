import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AuthShell } from '../../components/auth/AuthShell'
import { useApartment } from '../../context/ApartmentContext'
import { appRoutes } from '../../routes/paths'

export function JoinApartmentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { apartmentId } = useParams()
  const { current, addUserAccount } = useApartment()
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [errors, setErrors] = useState({ name: '', phone: '', email: '' })
  const [joined, setJoined] = useState(false)

  const inviteToken = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('token')
  }, [location.search])

  const apartmentName = useMemo(() => {
    if (!current) return 'הדירה המשותפת'
    if (!apartmentId || String(current.apartment.id) === apartmentId) {
      return current.apartment.name
    }
    return current.apartment.name
  }, [apartmentId, current])

  function validate() {
    const nextErrors = { name: '', phone: '', email: '' }
    const name = form.name.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()
    const phoneDigits = phone.replace(/\D/g, '')
    const isPhoneValid = phoneDigits.length >= 9 && phoneDigits.length <= 10
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!name) {
      nextErrors.name = 'חובה למלא שם מלא.'
    }
    if (!phone) {
      nextErrors.phone = 'נדרש מספר טלפון.'
    } else if (!isPhoneValid) {
      nextErrors.phone = 'מספר הטלפון לא תקין.'
    }
    if (!email) {
      nextErrors.email = 'נדרשת כתובת אימייל.'
    } else if (!isEmailValid) {
      nextErrors.email = 'כתובת האימייל לא תקינה.'
    }

    setErrors(nextErrors)
    return !nextErrors.name && !nextErrors.phone && !nextErrors.email
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    if (!current) {
      setErrors({
        name: '',
        phone: '',
        email: 'לא נמצאה דירה פעילה להצטרפות.',
      })
      return
    }

    addUserAccount({
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: 'tenant',
    })
    setJoined(true)
  }

  return (
    <AuthShell
      title="הצטרפות לדירה"
      subtitle="מאשרים את ההזמנה ומצטרפים לדירה המשותפת"
      hideIntro
      footer={
        <p className="auth-card__footer-text">
          כבר יש לכם חשבון?{' '}
          <Link to={appRoutes.login} className="link">
            התחברות
          </Link>
        </p>
      }
    >
      {joined ? (
        <div className="form-stack">
          <p className="form-message form-message--success">
            הצטרפתם בהצלחה לדירה "{apartmentName}". אפשר להתחבר ולהמשיך.
          </p>
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => navigate(appRoutes.login)}
          >
            מעבר להתחברות
          </button>
        </div>
      ) : (
        <form className="form-stack" onSubmit={onSubmit} noValidate>
          <div className="invite-summary">
            <p className="invite-summary__label">מצטרפים לדירה</p>
            <p className="invite-summary__name">{apartmentName}</p>
            {inviteToken ? (
              <p className="invite-summary__meta">קוד הזמנה מאומת</p>
            ) : null}
          </div>

          <label className="field">
            <span className="field__label">שם מלא</span>
            <input
              className="field__input"
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, name: event.target.value }))
              }
              placeholder="שם פרטי ושם משפחה"
            />
            {errors.name ? <span className="field__error">{errors.name}</span> : null}
          </label>
          <label className="field">
            <span className="field__label">מספר טלפון</span>
            <input
              className="field__input"
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, phone: event.target.value }))
              }
              placeholder="050-123-4567"
            />
            {errors.phone ? <span className="field__error">{errors.phone}</span> : null}
          </label>
          <label className="field">
            <span className="field__label">כתובת אימייל</span>
            <input
              className="field__input"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, email: event.target.value }))
              }
              placeholder="name@example.com"
            />
            {errors.email ? <span className="field__error">{errors.email}</span> : null}
          </label>
          <button type="submit" className="btn btn--primary btn--block">
            אישור הצטרפות
          </button>
        </form>
      )}
    </AuthShell>
  )
}
