import { useState, type FormEvent } from 'react'
import { Card } from '../../components/Card'
import { useApartment } from '../../context/ApartmentContext'
import { useAuth } from '../../context/AuthContext'
import { mockUsers } from '../../data/mock'

export function RoommatesPage() {
  const { user } = useAuth()
  const { current, addRoommate, removeRoommate, addLandlord } = useApartment()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLandlordModalOpen, setIsLandlordModalOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [landlordForm, setLandlordForm] = useState({
    name: '',
    phone: '',
    email: '',
  })
  const [errors, setErrors] = useState({ name: '', phone: '', email: '' })
  const [landlordError, setLandlordError] = useState('')
  const [landlordInviteLink, setLandlordInviteLink] = useState('')
  const [landlordInviteStatus, setLandlordInviteStatus] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const roommates = (current?.roommates ?? mockUsers).filter(
    (u) => u.status === 'active',
  )
  const isAdmin = user?.role === 'admin'

  function closeModal() {
    setIsModalOpen(false)
    setForm({ name: '', phone: '', email: '' })
    setErrors({ name: '', phone: '', email: '' })
  }

  function closeLandlordModal() {
    setIsLandlordModalOpen(false)
    setLandlordForm({ name: '', phone: '', email: '' })
    setLandlordError('')
    setLandlordInviteLink('')
    setLandlordInviteStatus('')
  }

  function closeInviteModal() {
    setIsInviteOpen(false)
    setInviteStatus('')
  }

  function buildInviteLink() {
    const base =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://ert.app'
    const token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `invite-${Date.now()}`
    const apartmentId = current?.apartment.id ?? 1
    return `${base}/invite/${apartmentId}?token=${token}`
  }

  function buildLandlordInviteLink() {
    const base =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://ert.app'
    const token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `invite-${Date.now()}`
    const apartmentId = current?.apartment.id ?? 1
    return `${base}/invite/${apartmentId}?role=landlord&token=${token}`
  }

  function openInviteModal() {
    setIsInviteOpen(true)
    setInviteStatus('')
    if (!inviteLink) {
      setInviteLink(buildInviteLink())
    }
  }

  async function onCopyInvite() {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setInviteStatus('הקישור הועתק ללוח.')
    } catch {
      setInviteStatus('לא הצלחנו להעתיק. אפשר לבחור ולהעתיק ידנית.')
    }
  }

  async function onCopyLandlordInvite() {
    try {
      await navigator.clipboard.writeText(landlordInviteLink)
      setLandlordInviteStatus('הקישור הועתק ללוח.')
    } catch {
      setLandlordInviteStatus('לא הצלחנו להעתיק. אפשר לבחור ולהעתיק ידנית.')
    }
  }

  function validateRoommate() {
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
    if (!validateRoommate()) return

    addRoommate({
      name: form.name,
      phone: form.phone,
      email: form.email,
    })
    closeModal()
  }

  function onLandlordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLandlordError('')
    setLandlordInviteStatus('')

    if (!landlordForm.name.trim()) {
      setLandlordError('צריך לציין שם מלא.')
      return
    }

    if (!landlordForm.phone.trim()) {
      setLandlordError('נדרש מספר טלפון.')
      return
    }

    if (!landlordForm.email.trim()) {
      setLandlordError('נדרשת כתובת אימייל.')
      return
    }

    addLandlord({
      name: landlordForm.name,
      phone: landlordForm.phone,
      email: landlordForm.email,
    })
    setLandlordInviteLink(buildLandlordInviteLink())
    setLandlordInviteStatus('הזמנת בעל הדירה מוכנה לשיתוף.')
  }

  return (
    <div className="page">
      <h1 className="page__title">דיירים פעילים</h1>

      <Card
        title="רשימה"
        action={
          isAdmin ? (
            <div className="roommate-actions">
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={() => setIsModalOpen(true)}
              >
                הוספת דייר
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={openInviteModal}
              >
                קישור הזמנה
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={() => setIsLandlordModalOpen(true)}
              >
                הזמנת בעל דירה
              </button>
            </div>
          ) : null
        }
      >
        <ul className="roommate-list">
          {roommates.map((u) => (
            <li key={u.id} className="roommate-list__item">
              <div className="roommate-list__main">
                <div className="roommate-list__name">{u.name}</div>
                <div className="roommate-list__meta">{u.email}</div>
              </div>
              <div className="roommate-list__aside">
                <span className="chip chip--primary">
                  {u.role === 'admin' ? 'דייר מנהל' : 'דייר'}
                </span>
                {isAdmin && u.role !== 'admin' ? (
                  <button
                    type="button"
                    className="btn-text btn-text--danger"
                    onClick={() => removeRoommate(u.id)}
                  >
                    הסרה
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="בעל הדירה">
        {current?.landlordUser ? (
          <div className="roommate-landlord">
            <div>
              <div className="roommate-list__name">{current.landlordUser.name}</div>
              <div className="roommate-list__meta">{current.landlordUser.email}</div>
              {current.landlordContact?.phone ? (
                <div className="roommate-list__meta" dir="ltr">
                  {current.landlordContact.phone}
                </div>
              ) : null}
            </div>
            <span className="chip chip--warning">בעל דירה</span>
          </div>
        ) : (
          <p className="muted">לא שויך בעל דירה.</p>
        )}
      </Card>

      {isAdmin && isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="roommate-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-roommate-title"
          >
            <div className="roommate-modal__head">
              <div>
                <p className="tickets-hero__eyebrow">דייר חדש</p>
                <h2 id="add-roommate-title">הוספת דייר לדירה</h2>
                <p>הדייר יתווסף כשותף רגיל.</p>
              </div>
              <button type="button" className="btn-text" onClick={closeModal}>
                סגירה
              </button>
            </div>

            <form className="roommate-form" onSubmit={onSubmit} noValidate>
              <label className="field">
                <span className="field__label">שם מלא</span>
                <input
                  className="field__input"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="שם פרטי ושם משפחה"
                />
                {errors.name ? (
                  <span className="field__error">{errors.name}</span>
                ) : null}
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
                {errors.phone ? (
                  <span className="field__error">{errors.phone}</span>
                ) : null}
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
                {errors.email ? (
                  <span className="field__error">{errors.email}</span>
                ) : null}
              </label>
              <div className="roommate-form__actions">
                <button type="button" className="btn btn--secondary" onClick={closeModal}>
                  ביטול
                </button>
                <button type="submit" className="btn btn--primary">
                  הוספת דייר
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isAdmin && isLandlordModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="roommate-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-landlord-title"
          >
            <div className="roommate-modal__head">
              <div>
                <p className="tickets-hero__eyebrow">בעל דירה</p>
                <h2 id="add-landlord-title">הזמנת בעל דירה לדירה</h2>
                <p>ניצור קישור הזמנה ונשייך את בעל הדירה לדירה.</p>
              </div>
              <button type="button" className="btn-text" onClick={closeLandlordModal}>
                סגירה
              </button>
            </div>

            <form className="roommate-form" onSubmit={onLandlordSubmit} noValidate>
              <label className="field">
                <span className="field__label">שם מלא</span>
                <input
                  className="field__input"
                  type="text"
                  value={landlordForm.name}
                  onChange={(event) =>
                    setLandlordForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
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
                  value={landlordForm.phone}
                  onChange={(event) =>
                    setLandlordForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
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
                  value={landlordForm.email}
                  onChange={(event) =>
                    setLandlordForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="name@example.com"
                />
              </label>
              {landlordError ? (
                <p className="form-message form-message--error">{landlordError}</p>
              ) : null}
              {landlordInviteStatus ? (
                <p className="form-message form-message--success">
                  {landlordInviteStatus}
                </p>
              ) : null}
              {landlordInviteLink ? (
                <label className="field">
                  <span className="field__label">קישור הזמנה לבעל הדירה</span>
                  <input
                    className="field__input"
                    type="text"
                    readOnly
                    value={landlordInviteLink}
                  />
                </label>
              ) : null}
              <div className="roommate-form__actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={closeLandlordModal}
                >
                  ביטול
                </button>
                {landlordInviteLink ? (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={onCopyLandlordInvite}
                  >
                    העתקת קישור
                  </button>
                ) : (
                  <button type="submit" className="btn btn--primary">
                    יצירת הזמנה
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isAdmin && isInviteOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="roommate-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
          >
            <div className="roommate-modal__head">
              <div>
                <p className="tickets-hero__eyebrow">הזמנה</p>
                <h2 id="invite-title">קישור הצטרפות לדירה</h2>
                <p>שתפו את הקישור עם דייר חדש.</p>
              </div>
              <button type="button" className="btn-text" onClick={closeInviteModal}>
                סגירה
              </button>
            </div>

            <div className="roommate-form">
              <label className="field">
                <span className="field__label">קישור הזמנה</span>
                <input className="field__input" type="text" readOnly value={inviteLink} />
                <span className="field__hint">הקישור תקף לדירה הנוכחית.</span>
              </label>
              {inviteStatus ? (
                <p className="form-message form-message--success">{inviteStatus}</p>
              ) : null}
              <div className="invite-actions">
                <button type="button" className="btn btn--secondary" onClick={closeInviteModal}>
                  סגירה
                </button>
                <button type="button" className="btn btn--primary" onClick={onCopyInvite}>
                  העתקת קישור
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
