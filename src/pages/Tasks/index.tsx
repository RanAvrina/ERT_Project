import { useMemo, useState, type FormEvent } from 'react'
import { Card } from '../../components/Card'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { TaskStatusChip } from '../../components/StatusChip'
import { useApartment } from '../../context/ApartmentContext'
import { useAuth } from '../../context/AuthContext'
import { useExpenses } from '../../context/ExpensesContext'
import {
  getTodayDate,
  isTaskIncomplete,
  isTaskOverdue,
  useTasks,
} from '../../context/TasksContext'
import { useTickets } from '../../context/TicketsContext'
import { useShoppingItemsStore } from '../../data/repositories/shoppingRepository'
import type { Task, TaskStatus, TaskType } from '../../types/models'

interface TaskFormState {
  taskType: TaskType
  homeItemId: string
  otherHomeItemName: string
  description: string
  assigneeId: string
  dueDate: string
  status: TaskStatus
}

interface HomeInventoryItem {
  id: string
  area: string
  name: string
  note: string
}

interface CalendarEvent {
  id: string
  date: string
  title: string
  type: 'task' | 'expense' | 'payment' | 'ticket' | 'shopping'
}

const OTHER_HOME_ITEM_ID = 'other'

const taskTypeOptions: { value: TaskType; label: string }[] = [
  { value: 'cleaning', label: 'ניקיון' },
  { value: 'maintenance', label: 'תחזוקה' },
  { value: 'shopping', label: 'קניות והשלמות' },
  { value: 'inspection', label: 'בדיקה' },
  { value: 'other', label: 'אחר' },
]

const taskStatusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'open', label: 'פתוחה' },
  { value: 'in_progress', label: 'בביצוע' },
  { value: 'done', label: 'בוצעה' },
  { value: 'cancelled', label: 'בוטלה' },
]

const calendarEventLabels: Record<CalendarEvent['type'], string> = {
  task: 'מטלה',
  expense: 'הוצאה',
  payment: 'תשלום',
  ticket: 'פנייה',
  shopping: 'קניות',
}

const weekDayLabels = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

const homeInventoryItems: HomeInventoryItem[] = [
  {
    id: 'kitchen',
    area: 'מטבח',
    name: 'מטבח',
    note: 'לנקות משטחי עבודה, כיריים ורצפה. להשאיר את אזור הכיור יבש בסיום.',
  },
  {
    id: 'kitchen-sink',
    area: 'מטבח',
    name: 'כיור מטבח',
    note: 'יש לבדוק שאין סתימה, לנקות מסננת ולייבש את הארון מתחת לכיור.',
  },
  {
    id: 'kitchen-window',
    area: 'מטבח',
    name: 'חלון מטבח',
    note: 'החלון קצת שבור. צריך לפתוח ולסגור אותו בזהירות ולא להפעיל כוח.',
  },
  {
    id: 'fridge',
    area: 'מטבח',
    name: 'מקרר',
    note: 'לזרוק מזון שפג תוקפו, לנגב מדפים ולהחזיר פריטים לקופסאות סגורות.',
  },
  {
    id: 'stove',
    area: 'מטבח',
    name: 'כיריים',
    note: 'להמתין שהכיריים יתקררו לפני ניקוי. לבדוק שהגז סגור בסיום.',
  },
  {
    id: 'living-room',
    area: 'סלון',
    name: 'סלון',
    note: 'לסדר כריות, לשאוב שטיח ולפנות כוסות/צלחות שנשארו באזור.',
  },
  {
    id: 'living-room-window',
    area: 'סלון',
    name: 'חלון סלון',
    note: 'לנקות מסילה לפני פתיחה מלאה. אם יש קושי בתנועה, לדווח לפני שממשיכים.',
  },
  {
    id: 'bathroom',
    area: 'שירותים ומקלחת',
    name: 'שירותים',
    note: 'לנקות אסלה, כיור ורצפה. להשאיר חלון פתוח לאוורור אחרי ניקוי.',
  },
  {
    id: 'shower',
    area: 'שירותים ומקלחת',
    name: 'מקלחת',
    note: 'לנקות זכוכית וניקוז. לבדוק שאין הצטברות מים ליד הדלת.',
  },
  {
    id: 'bathroom-sink',
    area: 'שירותים ומקלחת',
    name: 'כיור אמבטיה',
    note: 'לנקות אבנית סביב הברז ולבדוק שהניקוז יורד מהר.',
  },
  {
    id: 'washing-machine',
    area: 'שירות',
    name: 'מכונת כביסה',
    note: 'להשאיר דלת פתוחה אחרי שימוש, לנקות פילטר רק כשהמכונה כבויה.',
  },
  {
    id: 'entrance',
    area: 'כניסה',
    name: 'כניסה לבית',
    note: 'לטאטא, לפנות נעליים מהמעבר ולוודא שהדלת ננעלת חלק.',
  },
]

function getTaskTypeLabel(type: TaskType | null | undefined) {
  return taskTypeOptions.find((option) => option.value === type)?.label ?? 'מטלה'
}

function getHomeItemLabel(task: Task) {
  return task.target_item_name ?? task.title
}

function createInitialTaskForm(defaultAssigneeId?: number): TaskFormState {
  const defaultItem = homeInventoryItems[0]

  return {
    taskType: 'cleaning',
    homeItemId: defaultItem.id,
    otherHomeItemName: '',
    description: defaultItem.note,
    assigneeId: defaultAssigneeId ? String(defaultAssigneeId) : '',
    dueDate: new Date().toISOString().slice(0, 10),
    status: 'open',
  }
}

function formatTaskDate(date: string) {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('he-IL', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function toDateKey(value: string) {
  return value.slice(0, 10)
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const cells: ({ key: string; day: number; dateKey: string } | null)[] = []

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day)
    cells.push({
      key: `${year}-${month}-${day}`,
      day,
      dateKey: date.toISOString().slice(0, 10),
    })
  }

  return cells
}

function buildFormFromTask(task: Task, defaultAssigneeId?: number): TaskFormState {
  const matchingItem = homeInventoryItems.find((item) => item.id === task.target_item_id)
  const fallbackItemId = matchingItem ? matchingItem.id : OTHER_HOME_ITEM_ID

  return {
    taskType: task.task_type ?? 'cleaning',
    homeItemId: task.target_item_id ? fallbackItemId : OTHER_HOME_ITEM_ID,
    otherHomeItemName: matchingItem ? '' : task.target_item_name ?? task.title,
    description: task.description ?? matchingItem?.note ?? '',
    assigneeId: String(task.assignee_id ?? defaultAssigneeId ?? ''),
    dueDate: task.due_date ?? '',
    status: task.status,
  }
}

export function TasksPage() {
  const { user } = useAuth()
  const { current } = useApartment()
  const apartmentId = current?.apartment.id ?? 0
  const roommates = useMemo(
    () => (current?.roommates ?? []).filter((roommate) => roommate.status === 'active'),
    [current],
  )
  const getUserName = (userId: number | null) =>
    roommates.find((roommate) => roommate.id === userId)?.name
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const { expenses, payments } = useExpenses()
  const { tickets } = useTickets()
  const [shoppingItems] = useShoppingItemsStore()
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [taskForm, setTaskForm] = useState<TaskFormState>(() =>
    createInitialTaskForm(roommates[0]?.id),
  )
  const [formError, setFormError] = useState('')

  const today = getTodayDate()
  const apartmentTasks = tasks.filter((task) => task.apartment_id === apartmentId)
  const apartmentExpenses = expenses.filter(
    (expense) => expense.apartment_id === apartmentId && expense.status === 'active',
  )
  const apartmentPayments = payments.filter(
    (payment) => payment.apartment_id === apartmentId && payment.status === 'recorded',
  )
  const apartmentTickets = tickets.filter((ticket) => ticket.apartment_id === apartmentId)
  const apartmentShoppingItems = shoppingItems.filter(
    (item) => (item.apartment_id ?? apartmentId) === apartmentId,
  )
  const myOpenTasks = apartmentTasks.filter(
    (task) => task.assignee_id === user?.id && isTaskIncomplete(task),
  )
  const overdueTasks = apartmentTasks.filter((task) => isTaskOverdue(task, today))
  const selectedHomeItem = homeInventoryItems.find((item) => item.id === taskForm.homeItemId)
  const calendarDays = getMonthDays(calendarMonth)
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const taskEvents = apartmentTasks
      .filter((task) => task.due_date)
      .map((task) => ({
        id: `task-${task.id}`,
        date: task.due_date ?? '',
        title: task.title,
        type: 'task' as const,
      }))
    const expenseEvents = apartmentExpenses.map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      title: expense.description,
      type: 'expense' as const,
    }))
    const paymentEvents = apartmentPayments.map((payment) => ({
      id: `payment-${payment.id}`,
      date: toDateKey(payment.created_at),
      title: payment.note ? `תשלום - ${payment.note}` : 'תשלום נרשם',
      type: 'payment' as const,
    }))
    const ticketEvents = apartmentTickets.map((ticket) => ({
      id: `ticket-${ticket.id}`,
      date: toDateKey(ticket.created_at),
      title: ticket.title,
      type: 'ticket' as const,
    }))
    const shoppingEvents = apartmentShoppingItems.map((item) => ({
      id: `shopping-${item.id}`,
      date: toDateKey(item.purchased_at ?? item.created_at),
      title: item.status === 'purchased' ? `נרכש - ${item.item_name}` : `לקנות - ${item.item_name}`,
      type: 'shopping' as const,
    }))

    return [
      ...taskEvents,
      ...expenseEvents,
      ...paymentEvents,
      ...ticketEvents,
      ...shoppingEvents,
    ].sort((a, b) => a.date.localeCompare(b.date))
  }, [
    apartmentTasks,
    apartmentExpenses,
    apartmentPayments,
    apartmentTickets,
    apartmentShoppingItems,
  ])
  const calendarEventsByDate = useMemo(() => {
    return calendarEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      acc[event.date] = [...(acc[event.date] ?? []), event]
      return acc
    }, {})
  }, [calendarEvents])

  function moveCalendarMonth(offset: number) {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  }

  function updateTaskForm(field: keyof TaskFormState, value: string) {
    setTaskForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function updateHomeItem(value: string) {
    const item = homeInventoryItems.find((currentItem) => currentItem.id === value)

    setTaskForm((currentForm) => ({
      ...currentForm,
      homeItemId: value,
      otherHomeItemName: value === OTHER_HOME_ITEM_ID ? currentForm.otherHomeItemName : '',
      description: item?.note ?? '',
    }))
  }

  function buildTaskPayload() {
    const itemName =
      taskForm.homeItemId === OTHER_HOME_ITEM_ID
        ? taskForm.otherHomeItemName.trim()
        : selectedHomeItem?.name ?? ''
    const taskTypeLabel = getTaskTypeLabel(taskForm.taskType)

    return {
      title: `${taskTypeLabel} - ${itemName}`,
      description: taskForm.description.trim() || null,
      task_type: taskForm.taskType,
      target_item_id: taskForm.homeItemId === OTHER_HOME_ITEM_ID ? null : taskForm.homeItemId,
      target_item_name: itemName,
      assignee_id: Number(taskForm.assigneeId),
      due_date: taskForm.dueDate,
      status: taskForm.status,
    }
  }

  function openAddTaskModal() {
    setEditingTask(null)
    setTaskForm(createInitialTaskForm(roommates[0]?.id))
    setFormError('')
    setIsTaskModalOpen(true)
  }

  function openEditTaskModal(task: Task) {
    setSelectedTask(null)
    setEditingTask(task)
    setTaskForm(buildFormFromTask(task, roommates[0]?.id))
    setFormError('')
    setIsTaskModalOpen(true)
  }

  function closeTaskModal() {
    setIsTaskModalOpen(false)
    setEditingTask(null)
    setTaskForm(createInitialTaskForm(roommates[0]?.id))
    setFormError('')
  }

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (taskForm.homeItemId === OTHER_HOME_ITEM_ID && !taskForm.otherHomeItemName.trim()) {
      setFormError('צריך לכתוב עבור איזה פריט המטלה.')
      return
    }

    if (!taskForm.assigneeId) {
      setFormError('צריך לבחור מי אחראי על המטלה.')
      return
    }

    if (!taskForm.dueDate) {
      setFormError('צריך לבחור תאריך יעד.')
      return
    }

    const taskPayload = buildTaskPayload()

    if (editingTask) {
      const updatedTask = updateTask(editingTask.id, taskPayload)
      if (updatedTask) setSelectedTask(updatedTask)
    } else {
      addTask({
        apartment_id: apartmentId,
        created_by: user?.id ?? 0,
        ...taskPayload,
      })
    }

    closeTaskModal()
  }

  function confirmDeleteTask() {
    if (taskToDelete == null) return
    deleteTask(taskToDelete)
    if (selectedTask?.id === taskToDelete) setSelectedTask(null)
    if (editingTask?.id === taskToDelete) closeTaskModal()
    setTaskToDelete(null)
  }

  return (
    <div className="page tasks-page">
      <div className="page__head tasks-hero">
        <div>
          <p className="tasks-hero__eyebrow">מטלות ותקלות</p>
          <h1 className="page__title">ניהול מטלות הדירה</h1>
          <p className="page__lead">
            בוחרים סוג מטלה ופריט בבית, וההערות הקבועות של הפריט נכנסות אוטומטית.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary tasks-hero__action"
          onClick={openAddTaskModal}
        >
          + מטלה חדשה
        </button>
      </div>

      <section className="tasks-summary" aria-label="סיכום מטלות">
        <Card>
          <p className="tasks-summary__label">המטלות הפתוחות שלך</p>
          <p className="tasks-summary__value">{myOpenTasks.length}</p>
        </Card>
        <Card>
          <p className="tasks-summary__label">מטלות באיחור בדירה</p>
          <p className="tasks-summary__value tasks-summary__value--danger">{overdueTasks.length}</p>
        </Card>
      </section>

      <Card className="task-calendar-card">
        <div className="task-calendar__head">
          <div>
            <p className="tasks-hero__eyebrow">יומן דירה</p>
            <h2>{formatMonthLabel(calendarMonth)}</h2>
          </div>
          <div className="task-calendar__actions">
            <button type="button" className="btn btn--secondary btn--small" onClick={() => moveCalendarMonth(-1)}>
              קודם
            </button>
            <button type="button" className="btn btn--secondary btn--small" onClick={() => setCalendarMonth(new Date())}>
              היום
            </button>
            <button type="button" className="btn btn--secondary btn--small" onClick={() => moveCalendarMonth(1)}>
              הבא
            </button>
          </div>
        </div>

        <div className="task-calendar" aria-label="לוח שנה של מטלות ופעולות בדירה">
          {weekDayLabels.map((day) => (
            <div key={day} className="task-calendar__weekday">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="task-calendar__cell task-calendar__cell--empty" />

            const dayEvents = calendarEventsByDate[day.dateKey] ?? []
            const visibleEvents = dayEvents.slice(0, 3)

            return (
              <div
                key={day.key}
                className={`task-calendar__cell${day.dateKey === today ? ' task-calendar__cell--today' : ''}`}
              >
                <span className="task-calendar__day">{day.day}</span>
                <div className="task-calendar__events">
                  {visibleEvents.map((event) => (
                    <span key={event.id} className={`task-calendar__event task-calendar__event--${event.type}`}>
                      <b>{calendarEventLabels[event.type]}</b> {event.title}
                    </span>
                  ))}
                  {dayEvents.length > visibleEvents.length ? (
                    <span className="task-calendar__more">+{dayEvents.length - visibleEvents.length} נוספים</span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card title="המטלות הפתוחות שלך">
        {myOpenTasks.length === 0 ? (
          <p className="muted">אין לך מטלות פתוחות כרגע.</p>
        ) : (
          <ul className="task-list task-list--compact">
            {myOpenTasks.map((task) => (
              <li key={task.id} className="task-list__item">
                <span className="task-list__title">{task.title}</span>
                <TaskStatusChip status={task.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="מטלות באיחור">
        {overdueTasks.length === 0 ? (
          <p className="muted">אין מטלות באיחור.</p>
        ) : (
          <ul className="task-list task-list--compact">
            {overdueTasks.map((task) => (
              <li key={task.id} className="task-list__item">
                <div>
                  <span className="task-list__title">{task.title}</span>
                  <div className="task-list__meta">
                    {getUserName(task.assignee_id) ?? 'לא הוגדר'} · יעד:{' '}
                    {task.due_date ? formatTaskDate(task.due_date) : 'לא נקבע'}
                  </div>
                </div>
                <TaskStatusChip status={task.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="מטלות הדירה">
        {apartmentTasks.length === 0 ? (
          <p className="muted">אין עדיין מטלות בדירה.</p>
        ) : (
          <ul className="task-list task-list--cards">
            {apartmentTasks.map((task) => (
              <li key={task.id} className="task-list__item task-item-card">
                <button
                  type="button"
                  className="expense-item-card__button"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="task-item-card__main">
                    <div className="task-list__title">{task.title}</div>
                    <div className="task-list__meta">
                      <span>סוג: {getTaskTypeLabel(task.task_type)}</span>
                      <span>פריט: {getHomeItemLabel(task)}</span>
                      <span>אחראי: {getUserName(task.assignee_id) ?? 'לא הוגדר'}</span>
                      <span>יעד: {task.due_date ? formatTaskDate(task.due_date) : 'לא נקבע'}</span>
                    </div>
                    {task.description ? <p className="task-item-card__note">{task.description}</p> : null}
                  </div>
                  <div className="task-item-card__status">
                    <TaskStatusChip status={task.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="טבלת פריטים בבית">
        <div className="home-items-table-wrap">
          <table className="home-items-table">
            <thead>
              <tr>
                <th>אזור</th>
                <th>פריט</th>
                <th>הערות קבועות</th>
              </tr>
            </thead>
            <tbody>
              {homeInventoryItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.area}</td>
                  <td>{item.name}</td>
                  <td>{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isTaskModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="task-modal card" role="dialog" aria-modal="true" aria-labelledby="add-task-title">
            <div className="task-modal__head">
              <div>
                <p className="tasks-hero__eyebrow">{editingTask ? 'עריכת מטלה' : 'מטלה חדשה'}</p>
                <h2 id="add-task-title">{editingTask ? 'עדכון מטלה' : 'מה צריך לעשות?'}</h2>
              </div>
              <button type="button" className="btn-text" onClick={closeTaskModal}>
                סגירה
              </button>
            </div>

            <form className="task-form" onSubmit={handleAddTask} noValidate>
              <div className="task-form__grid">
                <label className="field">
                  <span className="field__label">סוג מטלה</span>
                  <select
                    className="field__input"
                    value={taskForm.taskType}
                    onChange={(event) => updateTaskForm('taskType', event.target.value as TaskType)}
                  >
                    {taskTypeOptions.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field__label">עבור מה המטלה</span>
                  <select
                    className="field__input"
                    value={taskForm.homeItemId}
                    onChange={(event) => updateHomeItem(event.target.value)}
                  >
                    {homeInventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.area}
                      </option>
                    ))}
                    <option value={OTHER_HOME_ITEM_ID}>אחר</option>
                  </select>
                </label>
              </div>

              {taskForm.homeItemId === OTHER_HOME_ITEM_ID ? (
                <label className="field">
                  <span className="field__label">שם פריט אחר</span>
                  <input
                    className="field__input"
                    value={taskForm.otherHomeItemName}
                    onChange={(event) => updateTaskForm('otherHomeItemName', event.target.value)}
                  />
                </label>
              ) : null}

              <label className="field">
                <span className="field__label">הערות לפריט</span>
                <textarea
                  className="field__input task-form__textarea"
                  value={taskForm.description}
                  onChange={(event) => updateTaskForm('description', event.target.value)}
                />
              </label>

              <div className="task-form__grid">
                <label className="field">
                  <span className="field__label">אחראי</span>
                  <select
                    className="field__input"
                    value={taskForm.assigneeId}
                    onChange={(event) => updateTaskForm('assigneeId', event.target.value)}
                  >
                    {roommates.map((roommate) => (
                      <option key={roommate.id} value={roommate.id}>
                        {roommate.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field__label">תאריך יעד</span>
                  <input
                    className="field__input"
                    type="date"
                    dir="ltr"
                    value={taskForm.dueDate}
                    onChange={(event) => updateTaskForm('dueDate', event.target.value)}
                  />
                </label>
              </div>

              <label className="field">
                <span className="field__label">סטטוס</span>
                <select
                  className="field__input"
                  value={taskForm.status}
                  onChange={(event) => updateTaskForm('status', event.target.value as TaskStatus)}
                >
                  {taskStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>

              {formError ? <p className="form-message form-message--error">{formError}</p> : null}

              <div className="task-form__actions">
                <button type="button" className="btn btn--secondary" onClick={closeTaskModal}>
                  ביטול
                </button>
                <button type="submit" className="btn btn--primary">
                  {editingTask ? 'שמירת שינויים' : 'שמירת מטלה'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {selectedTask ? (
        <div className="modal-backdrop" role="presentation">
          <section className="task-modal card" role="dialog" aria-modal="true" aria-labelledby="task-details-title">
            <div className="task-modal__head">
              <div>
                <p className="tasks-hero__eyebrow">פרטי מטלה</p>
                <h2 id="task-details-title">{selectedTask.title}</h2>
                <p>יעד: {selectedTask.due_date ? formatTaskDate(selectedTask.due_date) : 'לא נקבע'}</p>
              </div>
              <button type="button" className="btn-text" onClick={() => setSelectedTask(null)}>
                סגירה
              </button>
            </div>

            <div className="expense-detail">
              <div className="expense-detail__facts">
                <div>
                  <span>סוג</span>
                  <strong>{getTaskTypeLabel(selectedTask.task_type)}</strong>
                </div>
                <div>
                  <span>פריט</span>
                  <strong>{getHomeItemLabel(selectedTask)}</strong>
                </div>
                <div>
                  <span>אחראי</span>
                  <strong>{getUserName(selectedTask.assignee_id) ?? 'לא הוגדר'}</strong>
                </div>
                <div>
                  <span>סטטוס</span>
                  <strong>{taskStatusOptions.find((option) => option.value === selectedTask.status)?.label ?? selectedTask.status}</strong>
                </div>
              </div>

              {selectedTask.description ? (
                <div className="task-detail-note">
                  <span>הערות</span>
                  <p>{selectedTask.description}</p>
                </div>
              ) : null}

              <div className="expense-form__actions">
                <button type="button" className="btn btn--secondary" onClick={() => openEditTaskModal(selectedTask)}>
                  עריכה
                </button>
                <button type="button" className="btn btn--danger" onClick={() => setTaskToDelete(selectedTask.id)}>
                  מחיקה
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {taskToDelete != null ? (
        <ConfirmDialog
          title="למחוק את המטלה?"
          message="המטלה תוסר מרשימת המטלות ולא תופיע עוד בדירה."
          confirmLabel="מחיקה"
          cancelLabel="ביטול"
          onConfirm={confirmDeleteTask}
          onCancel={() => setTaskToDelete(null)}
        />
      ) : null}
    </div>
  )
}
