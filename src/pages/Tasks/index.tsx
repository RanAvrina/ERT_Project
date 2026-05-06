import { useState, type FormEvent } from 'react'
import { Card } from '../../components/Card'
import { TaskStatusChip } from '../../components/StatusChip'
import { useAuth } from '../../context/AuthContext'
import {
  getTodayDate,
  isTaskIncomplete,
  isTaskOverdue,
  useTasks,
} from '../../context/TasksContext'
import { mockUsers, userById } from '../../data/mock'
import type { TaskStatus } from '../../types/models'

interface TaskFormState {
  title: string
  assigneeId: string
  dueDate: string
  status: TaskStatus
}

const taskStatusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'open', label: 'פתוחה' },
  { value: 'in_progress', label: 'בביצוע' },
  { value: 'done', label: 'בוצעה' },
  { value: 'cancelled', label: 'בוטלה' },
]

const initialTaskForm: TaskFormState = {
  title: '',
  assigneeId: '1',
  dueDate: '2026-04-11',
  status: 'open',
}

function formatTaskDate(date: string) {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function TasksPage() {
  const { user } = useAuth()
  const { tasks, addTask, updateTaskStatus } = useTasks()
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskForm, setTaskForm] = useState<TaskFormState>(initialTaskForm)
  const [formError, setFormError] = useState('')
  const today = getTodayDate()
  const myOpenTasks = tasks.filter(
    (task) => task.assignee_id === user?.id && isTaskIncomplete(task),
  )
  const overdueTasks = tasks.filter((task) => isTaskOverdue(task, today))

  function updateTaskForm(field: keyof TaskFormState, value: string) {
    setTaskForm((current) => ({ ...current, [field]: value }))
  }

  function closeTaskModal() {
    setIsTaskModalOpen(false)
    setTaskForm(initialTaskForm)
    setFormError('')
  }

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (!taskForm.title.trim()) {
      setFormError('צריך לתת למטלה שם קצר וברור.')
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

    addTask({
      title: taskForm.title.trim(),
      assignee_id: Number(taskForm.assigneeId),
      due_date: taskForm.dueDate,
      status: taskForm.status,
      created_by: user?.id ?? 1,
    })
    closeTaskModal()
  }

  return (
    <div className="page tasks-page">
      <div className="page__head tasks-hero">
        <div>
          <p className="tasks-hero__eyebrow">מטלות</p>
          <h1 className="page__title">מה צריך לעשות?</h1>
        </div>
        <button
          type="button"
          className="btn btn--primary tasks-hero__action"
          onClick={() => setIsTaskModalOpen(true)}
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
          <p className="tasks-summary__value tasks-summary__value--danger">
            {overdueTasks.length}
          </p>
        </Card>
      </section>

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
            {overdueTasks.map((task) => {
              const assignee = task.assignee_id ? userById(task.assignee_id) : null

              return (
                <li key={task.id} className="task-list__item">
                  <div>
                    <span className="task-list__title">{task.title}</span>
                    <div className="task-list__meta">
                      {assignee?.name ?? 'לא הוגדר'} · יעד:{' '}
                      {task.due_date ? formatTaskDate(task.due_date) : 'לא נקבע'}
                    </div>
                  </div>
                  <TaskStatusChip status={task.status} />
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card title="מטלות הדירה">
        <ul className="task-list task-list--cards">
          {tasks.map((task) => {
            const assignee = task.assignee_id ? userById(task.assignee_id) : null

            return (
              <li key={task.id} className="task-list__item task-item-card">
                <div className="task-item-card__main">
                  <div className="task-list__title">{task.title}</div>
                  <div className="task-list__meta">
                    <span>אחראי: {assignee?.name ?? 'לא הוגדר'}</span>
                    <span>
                      יעד:{' '}
                      {task.due_date ? formatTaskDate(task.due_date) : 'לא נקבע'}
                    </span>
                  </div>
                </div>
                <div className="task-item-card__status">
                  <TaskStatusChip status={task.status} />
                  <label className="task-status-control">
                    <span>עדכון סטטוס</span>
                    <select
                      value={task.status}
                      onChange={(event) =>
                        updateTaskStatus(task.id, event.target.value as TaskStatus)
                      }
                    >
                      {taskStatusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      {isTaskModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="task-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-title"
          >
            <div className="task-modal__head">
              <div>
                <p className="tasks-hero__eyebrow">מטלה חדשה</p>
                <h2 id="add-task-title">מה צריך לעשות?</h2>
                <p>הוספת מטלה נשמרת כרגע רק ברשימת הדמו המקומית.</p>
              </div>
              <button type="button" className="btn-text" onClick={closeTaskModal}>
                סגירה
              </button>
            </div>

            <form className="task-form" onSubmit={handleAddTask} noValidate>
              <label className="field">
                <span className="field__label">שם המטלה</span>
                <input
                  className="field__input"
                  value={taskForm.title}
                  onChange={(event) => updateTaskForm('title', event.target.value)}
                  placeholder="לדוגמה: ניקיון סלון"
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
                    {mockUsers.map((roommate) => (
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
                  onChange={(event) =>
                    updateTaskForm('status', event.target.value as TaskStatus)
                  }
                >
                  {taskStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>

              {formError ? (
                <p className="form-message form-message--error">{formError}</p>
              ) : null}

              <div className="task-form__actions">
                <button type="button" className="btn btn--secondary" onClick={closeTaskModal}>
                  ביטול
                </button>
                <button type="submit" className="btn btn--primary">
                  שמירת מטלה
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}
