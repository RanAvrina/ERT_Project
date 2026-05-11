import { useMemo, useRef, useState, type FormEvent } from 'react'
import { useApartment } from '../context/ApartmentContext'
import { useAuth } from '../context/AuthContext'
import { useExpenses } from '../context/ExpensesContext'
import { isTaskIncomplete, isTaskOverdue, useTasks } from '../context/TasksContext'
import { useTickets } from '../context/TicketsContext'
import type { Expense, Task, User } from '../types/models'

type AssistantRole = 'user' | 'assistant'

interface AssistantMessage {
  id: string
  role: AssistantRole
  content: string
}

function formatCurrency(amount: string | number) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return String(amount)
  return value.toLocaleString('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 2,
  })
}

function formatDate(date: string | null | undefined) {
  if (!date) return 'ללא תאריך'
  return new Date(date).toLocaleDateString('he-IL')
}

function normalizeText(text: string) {
  return text.trim().toLowerCase()
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term))
}

function userName(usersById: Record<number, string>, id: number | null | undefined) {
  if (!id) return 'לא משויך'
  return usersById[id] ?? `משתמש ${id}`
}

function taskLine(task: Task, usersById: Record<number, string>) {
  return `${task.title} - ${userName(usersById, task.assignee_id)}, עד ${formatDate(task.due_date)}, סטטוס: ${task.status}`
}

function explainUserDebt(
  user: User | null,
  expenses: Expense[],
  usersById: Record<number, string>,
) {
  if (!user) return 'צריך להתחבר כדי שאוכל לחשב את החובות האישיים שלך.'

  const relevantExpenses = expenses
    .filter(
      (expense) =>
        expense.status === 'active' &&
        expense.participant_ids.includes(user.id) &&
        expense.paid_by !== user.id,
    )
    .slice(0, 6)

  if (relevantExpenses.length === 0) {
    return 'לא מצאתי הוצאות פעילות שמסבירות חוב שלך כרגע.'
  }

  const lines = relevantExpenses.map((expense) => {
    const share = Number(expense.amount) / Math.max(expense.participant_ids.length, 1)
    return `- ${expense.description}: ${formatCurrency(share)} מתוך ${formatCurrency(expense.amount)}, שולם על ידי ${userName(usersById, expense.paid_by)}`
  })

  return `החוב שלך נוצר בעיקר מהוצאות ששולמו על ידי דיירים אחרים ואתה משתתף בהן:\n${lines.join('\n')}`
}

export function AssistantWidget() {
  const { user } = useAuth()
  const { current } = useApartment()
  const { tasks } = useTasks()
  const { expenses, payments, settlements, netBalanceByUser } = useExpenses()
  const { tickets, comments } = useTickets()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'היי, אני הסוכן הפנימי שלך. אפשר לשאול אותי על מטלות, חובות, הוצאות, תשלומים, דיירים ותקלות.',
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const apartmentId = current?.apartment.id

  const allUsers = useMemo(
    () =>
      current
        ? [
            current.adminUser,
            ...current.roommates,
            ...(current.landlordUser ? [current.landlordUser] : []),
          ]
        : [],
    [current],
  )

  const usersById = useMemo(
    () => Object.fromEntries(allUsers.map((roommate) => [roommate.id, roommate.name])),
    [allUsers],
  )

  const activeTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.apartment_id === apartmentId && isTaskIncomplete(task))
        .sort((a, b) => String(a.due_date ?? '9999').localeCompare(String(b.due_date ?? '9999'))),
    [apartmentId, tasks],
  )

  const userTasks = useMemo(
    () => activeTasks.filter((task) => task.assignee_id === user?.id),
    [activeTasks, user],
  )

  const activeExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) => expense.apartment_id === apartmentId && expense.status === 'active',
      ),
    [apartmentId, expenses],
  )

  const activePayments = useMemo(
    () =>
      payments.filter(
        (payment) => payment.apartment_id === apartmentId && payment.status === 'recorded',
      ),
    [apartmentId, payments],
  )

  const openTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) => ticket.apartment_id === apartmentId && ticket.status !== 'closed',
      ),
    [apartmentId, tickets],
  )

  function buildLocalAnswer(question: string) {
    const text = normalizeText(question)

    if (!current) {
      return 'לא מצאתי דירה פעילה. צריך ליצור דירה או להתחבר לדירה כדי שאוכל לענות לפי הנתונים.'
    }

    if (hasAny(text, ['עזרה', 'מה אפשר', 'מה אתה יודע', 'פקודות'])) {
      return [
        'אפשר לשאול אותי למשל:',
        '- מתי המטלה הבאה שלי?',
        '- למי אני חייב כסף?',
        '- למה אני חייב כסף?',
        '- מי חייב לי?',
        '- מה ההוצאות האחרונות?',
        '- איזה תקלות פתוחות יש?',
        '- מי הדיירים בדירה?',
      ].join('\n')
    }

    if (hasAny(text, ['שלום', 'היי', 'בוקר טוב', 'ערב טוב'])) {
      return `שלום ${user?.name ?? ''}. אני כאן לשאלות על הדירה והנתונים באפליקציה.`
    }

    if (hasAny(text, ['מטלה', 'משימה', 'משימות', 'מטלות'])) {
      const relevantTasks = hasAny(text, ['שלי', 'עליי', 'עלי']) ? userTasks : activeTasks
      const overdueTasks = relevantTasks.filter((task) => isTaskOverdue(task))

      if (hasAny(text, ['הבאה', 'קרובה', 'מתי'])) {
        const nextTask = relevantTasks[0]
        return nextTask
          ? `המטלה הבאה היא: ${taskLine(nextTask, usersById)}.`
          : 'אין כרגע מטלות פתוחות שמתאימות לשאלה.'
      }

      if (hasAny(text, ['איחור', 'באיחור', 'עבר'])) {
        return overdueTasks.length
          ? `יש ${overdueTasks.length} מטלות באיחור:\n${overdueTasks.map((task) => `- ${taskLine(task, usersById)}`).join('\n')}`
          : 'אין כרגע מטלות באיחור.'
      }

      return relevantTasks.length
        ? `מצאתי ${relevantTasks.length} מטלות פתוחות:\n${relevantTasks.slice(0, 8).map((task) => `- ${taskLine(task, usersById)}`).join('\n')}`
        : 'אין כרגע מטלות פתוחות שמתאימות לשאלה.'
    }

    if (hasAny(text, ['למה']) && hasAny(text, ['חייב', 'חוב', 'כסף'])) {
      return explainUserDebt(user, activeExpenses, usersById)
    }

    if (hasAny(text, ['חייב', 'חוב', 'כסף', 'יתרה', 'מאזן'])) {
      const balance = user ? (netBalanceByUser[user.id] ?? 0) : 0
      const userPays = settlements.filter((settlement) => settlement.payer_id === user?.id)
      const userReceives = settlements.filter((settlement) => settlement.payee_id === user?.id)

      if (hasAny(text, ['מי חייב לי', 'חייב לי', 'לקבל'])) {
        return userReceives.length
          ? `אלה החובות אליך:\n${userReceives.map((settlement) => `- ${userName(usersById, settlement.payer_id)} צריך לשלם לך ${formatCurrency(settlement.amount)}`).join('\n')}`
          : 'לא מצאתי כרגע מישהו שחייב לך כסף.'
      }

      if (userPays.length) {
        return `היתרה שלך היא ${formatCurrency(balance)}. לפי החישוב הנוכחי אתה צריך לשלם:\n${userPays.map((settlement) => `- ${formatCurrency(settlement.amount)} ל${userName(usersById, settlement.payee_id)}`).join('\n')}`
      }

      if (userReceives.length) {
        return `היתרה שלך היא ${formatCurrency(balance)}. כרגע צריכים לשלם לך:\n${userReceives.map((settlement) => `- ${userName(usersById, settlement.payer_id)}: ${formatCurrency(settlement.amount)}`).join('\n')}`
      }

      return `היתרה שלך היא ${formatCurrency(balance)}. אין כרגע חובות פתוחים לסגירה.`
    }

    if (hasAny(text, ['הוצאה', 'הוצאות', 'קניות', 'שולם'])) {
      if (!activeExpenses.length) return 'אין כרגע הוצאות פעילות בדירה.'

      return `ההוצאות האחרונות הן:\n${activeExpenses
        .slice(0, 8)
        .map(
          (expense) =>
            `- ${expense.description}: ${formatCurrency(expense.amount)}, שולם על ידי ${userName(usersById, expense.paid_by)}, בתאריך ${formatDate(expense.date)}`,
        )
        .join('\n')}`
    }

    if (hasAny(text, ['תשלום', 'תשלומים', 'שילם', 'העברה'])) {
      if (!activePayments.length) return 'אין כרגע תשלומים רשומים.'

      return `התשלומים האחרונים הם:\n${activePayments
        .slice(0, 8)
        .map(
          (payment) =>
            `- ${userName(usersById, payment.payer_id)} שילם ל${userName(usersById, payment.payee_id)} ${formatCurrency(payment.amount)} בתאריך ${formatDate(payment.created_at)}`,
        )
        .join('\n')}`
    }

    if (hasAny(text, ['דייר', 'דיירים', 'שותף', 'שותפים', 'מי גר'])) {
      return `בדירה ${current.apartment.name} יש ${current.roommates.length} דיירים פעילים ברשימה:\n${current.roommates
        .map((roommate) => `- ${roommate.name} (${roommate.role})`)
        .join('\n')}`
    }

    if (hasAny(text, ['בעל דירה', 'משכיר', 'לנדלורד'])) {
      return current.landlordUser
        ? `בעל הדירה הרשום הוא ${current.landlordUser.name}, אימייל: ${current.landlordUser.email}.`
        : 'לא רשום כרגע בעל דירה במערכת.'
    }

    if (hasAny(text, ['תקלה', 'תקלות', 'קריאה', 'טיקט', 'תיקון'])) {
      if (!openTickets.length) return 'אין כרגע תקלות פתוחות.'

      return `התקלות הפתוחות הן:\n${openTickets
        .slice(0, 8)
        .map((ticket) => {
          const count = comments.filter((comment) => comment.ticket_id === ticket.id).length
          return `- ${ticket.title}: ${ticket.status}, נפתח על ידי ${userName(usersById, ticket.created_by)}, ${count} תגובות`
        })
        .join('\n')}`
    }

    if (hasAny(text, ['דירה', 'בית', 'שם הדירה'])) {
      return `הדירה הפעילה היא ${current.apartment.name}. מספר הדירה במערכת: ${current.apartment.id}.`
    }

    return 'לא הבנתי עד הסוף את השאלה. אפשר לשאול על מטלות, חובות, הוצאות, תשלומים, דיירים או תקלות.'
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = input.trim()
    if (!content) return

    const reply = buildLocalAnswer(content)
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: crypto.randomUUID(), role: 'user', content },
      { id: crypto.randomUUID(), role: 'assistant', content: reply },
    ])
    setInput('')

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
  }

  return (
    <section className={`assistant-widget${isOpen ? ' assistant-widget--open' : ''}`}>
      {isOpen ? (
        <div className="assistant-panel" aria-label="סוכן אישי">
          <div className="assistant-panel__head">
            <div>
              <h2>הסוכן שלי</h2>
              <p>תשובות פנימיות מנתוני האפליקציה</p>
            </div>
            <button
              type="button"
              className="assistant-panel__close"
              onClick={() => setIsOpen(false)}
              aria-label="סגירת צ׳אט"
            >
              ×
            </button>
          </div>

          <div className="assistant-panel__messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`assistant-message assistant-message--${message.role}`}
              >
                {message.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="assistant-panel__form" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="לדוגמה: מתי המטלה הבאה שלי?"
              aria-label="שאלה לסוכן האישי"
            />
            <button type="submit" disabled={!input.trim()}>
              שלח
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        className="assistant-fab"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="פתיחת הסוכן האישי"
      >
        AI
      </button>
    </section>
  )
}
