import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../../components/Card'
import { TicketStatusChip } from '../../components/StatusChip'
import { useAuth } from '../../context/AuthContext'
import { useApartment } from '../../context/ApartmentContext'
import { useTickets } from '../../context/TicketsContext'
import { userById } from '../../data/mock'
import { appRoutes } from '../../routes/paths'
import type { TicketStatus } from '../../types/models'

function formatTicketDateTime(value: string) {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function TicketDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { current } = useApartment()
  const { getTicketById, addComment, updateTicketStatus, getCommentsByTicketId } =
    useTickets()
  const ticket = getTicketById(id)
  const apartmentId = current?.apartment.id ?? 1
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState('')
  const isLandlord = user?.role === 'landlord'

  if (!ticket || ticket.apartment_id !== apartmentId) {
    return (
      <div className="page">
        <p>לא מצאנו את הפנייה הזו.</p>
        <Link to={appRoutes.tickets} className="link">
          חזרה לפניות
        </Link>
      </div>
    )
  }

  const knownUsers = [
    ...(current?.roommates ?? []),
    ...(current?.landlordUser ? [current.landlordUser] : []),
  ]
  const author =
    knownUsers.find((candidate) => candidate.id === ticket.created_by) ??
    userById(ticket.created_by)
  const comments = getCommentsByTicketId(ticket.id)

  function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCommentError('')

    if (!commentText.trim()) {
      setCommentError('צריך לכתוב עדכון קצר לפני השליחה.')
      return
    }

    addComment(ticket.id, user?.id ?? 1, commentText.trim())
    setCommentText('')
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    updateTicketStatus(ticket.id, event.target.value as TicketStatus)
  }

  return (
    <div className="page">
      <Link to={appRoutes.tickets} className="link back-link">
        חזרה לפניות
      </Link>
      <div className="page__head page__head--ticket">
        <h1 className="page__title">{ticket.title}</h1>
        <div className="ticket-status">
          <TicketStatusChip status={ticket.status} />
          {isLandlord ? (
            <label className="ticket-status__control">
              <span>סטטוס טיפול</span>
              <select
                className="field__input"
                value={ticket.status}
                onChange={handleStatusChange}
              >
                <option value="open">פתוח</option>
                <option value="sent_to_landlord">הועבר לבעל הדירה</option>
                <option value="in_progress">בטיפול</option>
                <option value="closed">סגור</option>
                <option value="cancelled">מבוטל</option>
              </select>
            </label>
          ) : null}
        </div>
      </div>

      <Card title="פרטי הפנייה">
        <p className="ticket-body">{ticket.description}</p>
        <div className="ticket-facts">
          <span>קטגוריה: {ticket.category}</span>
          <span>נפתחה על ידי: {author?.name ?? 'דייר'}</span>
          <span>נפתחה: {formatTicketDateTime(ticket.created_at)}</span>
        </div>
      </Card>

      <Card title="עדכונים ושיח">
        {comments.length === 0 ? (
          <p className="muted">אין עדכונים עדיין.</p>
        ) : (
          <ul className="comment-list">
            {comments.map((c) => {
              const u =
                knownUsers.find((candidate) => candidate.id === c.user_id) ??
                userById(c.user_id)
              return (
                <li key={c.id} className="comment-list__item">
                  <div className="comment-list__meta">
                    {u?.name} · {c.created_at.replace('T', ' ').slice(0, 16)}
                  </div>
                  <p className="comment-list__text">{c.comment_text}</p>
                </li>
              )
            })}
          </ul>
        )}
        {isLandlord ? (
          <form className="comment-form" onSubmit={handleCommentSubmit} noValidate>
            <label className="field">
              <span className="field__label">עדכון חדש</span>
              <textarea
                className="field__input comment-form__textarea"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="כתבו תגובה קצרה לדיירים"
              />
            </label>
            {commentError ? (
              <p className="form-message form-message--error">{commentError}</p>
            ) : null}
            <div className="comment-form__actions">
              <button type="submit" className="btn btn--primary">
                שליחת עדכון
              </button>
            </div>
          </form>
        ) : null}
      </Card>

      <Card title="קבצים מצורפים">
        {ticket.attachments.length === 0 ? (
          <p className="muted">לא צורפו קבצים לפנייה הזו.</p>
        ) : (
          <ul className="ticket-attachments">
            {ticket.attachments.map((attachment) => (
              <li key={attachment.id} className="ticket-attachments__item">
                <a href={attachment.url} target="_blank" rel="noreferrer">
                  {attachment.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
