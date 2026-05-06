import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../../components/auth/AuthShell'
import { useApartment } from '../../context/ApartmentContext'
import { appRoutes } from '../../routes/paths'

export function CreateApartmentPage() {
  const navigate = useNavigate()
  const { createApartment } = useApartment()
  const [form, setForm] = useState({
    apartmentName: '',
    adminName: '',
    phone: '',
    email: '',
  })
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!form.apartmentName.trim()) {
      setError('צריך לבחור שם לדירה.')
      return
    }

    if (!form.adminName.trim()) {
      setError('צריך לציין את שם הדייר הראשון.')
      return
    }

    if (!form.phone.trim()) {
      setError('נדרש מספר טלפון.')
      return
    }

    if (!form.email.trim()) {
      setError('נדרשת כתובת אימייל.')
      return
    }

    createApartment({
      apartmentName: form.apartmentName,
      adminName: form.adminName,
      adminPhone: form.phone,
      adminEmail: form.email,
    })
    setCreated(true)
  }

  return (
    <AuthShell
      title="פתיחת דירה חדשה"
      subtitle="פרטים ראשוניים להגדרת הדירה"
      hideIntro
      footer={
        <p className="auth-card__footer-text">
          כבר יש לכם דירה?{' '}
          <Link to={appRoutes.login} className="link">
            התחברות
          </Link>
        </p>
      }
    >
      {created ? (
        <div className="form-stack">
          <p className="form-message">
            הדירה נוצרה והדייר הראשון הוגדר כמנהל.
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
          <label className="field">
            <span className="field__label">שם הדירה</span>
            <input
              className="field__input"
              type="text"
              value={form.apartmentName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  apartmentName: event.target.value,
                }))
              }
              placeholder="לדוגמה: דירת השותפים — הרצל"
            />
          </label>
          <label className="field">
            <span className="field__label">שם מלא של הדייר הראשון</span>
            <input
              className="field__input"
              type="text"
              value={form.adminName}
              onChange={(event) =>
                setForm((current) => ({ ...current, adminName: event.target.value }))
              }
              placeholder="שם פרטי ושם משפחה"
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
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="name@example.com"
            />
          </label>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          <button type="submit" className="btn btn--primary btn--block">
            יצירת דירה
          </button>
        </form>
      )}
    </AuthShell>
  )
}
