import { useState, type FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PaymentStatusChip } from '../../components/StatusChip'
import { useAuth } from '../../context/AuthContext'
import { useExpenses } from '../../context/ExpensesContext'
import { mockUsers, userById } from '../../data/mock'
import type { Payment } from '../../types/models'

interface PaymentFormState {
  payerId: string
  payeeId: string
  amount: string
  paymentDate: string
  note: string
}

const initialPaymentForm: PaymentFormState = {
  payerId: '1',
  payeeId: '2',
  amount: '',
  paymentDate: '2026-04-11',
  note: '',
}

function createInitialPaymentForm(currentUserId?: number): PaymentFormState {
  const payerId = currentUserId ?? Number(initialPaymentForm.payerId)
  const payeeId =
    mockUsers.find((roommate) => roommate.id !== payerId)?.id ??
    Number(initialPaymentForm.payeeId)

  return {
    ...initialPaymentForm,
    payerId: String(payerId),
    payeeId: String(payeeId),
  }
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 2,
  }).format(Number(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function paymentDirection(payment: Payment, currentUserId?: number) {
  if (!currentUserId) return ''
  if (payment.payer_id === currentUserId) return 'תשלום שרשמת'
  if (payment.payee_id === currentUserId) return 'תשלום שמיועד אליך'
  return ''
}

export function PaymentsPage() {
  const { user } = useAuth()
  const { payments, addPayment, settlements, netBalanceByUser } = useExpenses()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(() =>
    createInitialPaymentForm(user?.id),
  )
  const [formError, setFormError] = useState('')
  const myId = user?.id
  const totalBalanceToSettle = settlements.reduce(
    (sum, settlement) => sum + Number(settlement.amount),
    0,
  )
  const myNetBalance = myId ? netBalanceByUser[myId] ?? 0 : 0
  const totalRecordedPayments = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  )
  function updatePaymentForm(field: keyof PaymentFormState, value: string) {
    setPaymentForm((current) => ({ ...current, [field]: value }))
  }

  function closePaymentModal() {
    setIsPaymentModalOpen(false)
    setFormError('')
    setPaymentForm(createInitialPaymentForm(user?.id))
  }

  function handleAddPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    const amount = Number(paymentForm.amount)
    if (!paymentForm.payerId) {
      setFormError('צריך לבחור מי שילם.')
      return
    }

    if (!paymentForm.payeeId) {
      setFormError('צריך לבחור למי התשלום הועבר.')
      return
    }

    if (paymentForm.payerId === paymentForm.payeeId) {
      setFormError('המשלם והמקבל צריכים להיות דיירים שונים.')
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('הסכום חייב להיות מספר חיובי.')
      return
    }

    if (!paymentForm.paymentDate) {
      setFormError('צריך לבחור תאריך תשלום.')
      return
    }

    addPayment({
      apartment_id: 1,
      payer_id: Number(paymentForm.payerId),
      payee_id: Number(paymentForm.payeeId),
      amount: amount.toFixed(2),
      created_at: `${paymentForm.paymentDate}T12:00:00`,
      note: paymentForm.note.trim() || null,
    })

    closePaymentModal()
  }

  return (
    <div className="page payments-page">
      <div className="page__head payments-hero">
        <div>
          <p className="payments-hero__eyebrow">תשלומים</p>
          <h1 className="page__title">מי שילם למי?</h1>
        </div>
        <button
          type="button"
          className="btn btn--primary payments-hero__action"
          onClick={() => setIsPaymentModalOpen(true)}
        >
          רישום תשלום
        </button>
      </div>

      <section className="payments-summary" aria-label="סיכום תשלומים">
        <Card className="payments-summary__main">
          <p className="payments-summary__label">סה״כ תשלומים שנרשמו</p>
          <p className="payments-summary__amount">
            {formatCurrency(totalRecordedPayments)}
          </p>
          <p className="payments-summary__hint">
            תשלומים שנרשמים כאן מקטינים את היתרות בין הדיירים.
          </p>
        </Card>

        <div className="payments-summary__grid">
          <Card>
            <p className="payments-mini-stat__label">יתרה לתיאום</p>
            <p className="payments-mini-stat__value">
              {formatCurrency(totalBalanceToSettle)}
            </p>
          </Card>
          <Card>
            <p className="payments-mini-stat__label">היתרה שלך</p>
            <p
              className={`payments-mini-stat__value${
                myNetBalance < -0.005 ? ' payments-mini-stat__value--danger' : ''
              }`}
            >
              {formatCurrency(Math.abs(myNetBalance))}
            </p>
            <p className="payments-mini-stat__hint">
              {myNetBalance > 0.005
                ? 'חייבים לך'
                : myNetBalance < -0.005
                  ? 'אתה חייב'
                  : 'מאוזן'}
            </p>
          </Card>
        </div>
      </section>

      <Card title="יתרות לתיאום">
        {settlements.length === 0 ? (
          <p className="muted">אין יתרות פתוחות לפי ההוצאות שנרשמו.</p>
        ) : (
          <ul className="debt-list">
            {settlements.map((settlement) => {
              const payer = userById(settlement.payer_id)
              const payee = userById(settlement.payee_id)
              const isRelatedToMe =
                myId != null &&
                (settlement.payer_id === myId || settlement.payee_id === myId)

              return (
                <li key={settlement.id} className="debt-list__item">
                  <div className="debt-list__route">
                    <span className="debt-list__person">{payer?.name}</span>
                    <span className="debt-list__arrow">←</span>
                    <span className="debt-list__person">{payee?.name}</span>
                  </div>
                  <div className="debt-list__meta">
                    <span>לפי חלוקה שווה של ההוצאות</span>
                    {isRelatedToMe ? <span className="debt-list__tag">שלך</span> : null}
                  </div>
                  <strong className="debt-list__amount">
                    {formatCurrency(settlement.amount)}
                  </strong>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card title="תשלומים אחרונים">
        <ul className="payment-list payment-list--cards">
          {payments.map((payment) => {
            const payer = userById(payment.payer_id)
            const payee = userById(payment.payee_id)
            const direction = paymentDirection(payment, myId)

            return (
              <li key={payment.id} className="payment-list__item payment-item-card">
                <div className="payment-item-card__main">
                  <div className="payment-list__title">
                    {payer?.name} שילם ל{payee?.name ? `־${payee.name}` : ''}
                  </div>
                  <div className="payment-list__meta">
                    {formatDateTime(payment.created_at)}
                    {direction ? ` · ${direction}` : ''}
                  </div>
                  {payment.note ? (
                    <div className="payment-list__note">{payment.note}</div>
                  ) : null}
                </div>
                <div className="payment-list__right">
                  <div className="payment-list__amount">{formatCurrency(payment.amount)}</div>
                  <PaymentStatusChip status={payment.status} />
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      {isPaymentModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="payment-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-payment-title"
          >
            <div className="payment-modal__head">
              <div>
                <p className="payments-hero__eyebrow">רישום תשלום</p>
                <h2 id="add-payment-title">תשלום חדש</h2>
                <p>התשלום יישמר ברשימת התשלומים בדמו מיד לאחר השמירה.</p>
              </div>
              <button type="button" className="btn-text" onClick={closePaymentModal}>
                סגירה
              </button>
            </div>

            <form className="payment-form" onSubmit={handleAddPayment} noValidate>
              <div className="payment-form__grid">
                <label className="field">
                  <span className="field__label">מי שילם?</span>
                  <select
                    className="field__input"
                    value={paymentForm.payerId}
                    onChange={(event) => updatePaymentForm('payerId', event.target.value)}
                  >
                    {mockUsers.map((roommate) => (
                      <option key={roommate.id} value={roommate.id}>
                        {roommate.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field__label">למי שילמו?</span>
                  <select
                    className="field__input"
                    value={paymentForm.payeeId}
                    onChange={(event) => updatePaymentForm('payeeId', event.target.value)}
                  >
                    {mockUsers.map((roommate) => (
                      <option key={roommate.id} value={roommate.id}>
                        {roommate.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="payment-form__grid">
                <label className="field">
                  <span className="field__label">סכום</span>
                  <input
                    className="field__input"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    dir="ltr"
                    value={paymentForm.amount}
                    onChange={(event) => updatePaymentForm('amount', event.target.value)}
                    placeholder="0.00"
                  />
                </label>

                <label className="field">
                  <span className="field__label">תאריך תשלום</span>
                  <input
                    className="field__input"
                    type="date"
                    dir="ltr"
                    value={paymentForm.paymentDate}
                    onChange={(event) =>
                      updatePaymentForm('paymentDate', event.target.value)
                    }
                  />
                </label>
              </div>

              <label className="field">
                <span className="field__label">הערה (לא חובה)</span>
                <textarea
                  className="field__input payment-form__textarea"
                  value={paymentForm.note}
                  onChange={(event) => updatePaymentForm('note', event.target.value)}
                  placeholder="לדוגמה: הועבר בביט"
                />
              </label>

              {formError ? (
                <p className="form-message form-message--error">{formError}</p>
              ) : null}

              <div className="payment-form__actions">
                <button type="button" className="btn btn--secondary" onClick={closePaymentModal}>
                  ביטול
                </button>
                <button type="submit" className="btn btn--primary">
                  שמירת תשלום
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}
