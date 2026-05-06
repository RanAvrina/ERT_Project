import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isTaskIncomplete, useTasks } from '../../context/TasksContext'
import {
  mockApartment,
  mockNotifications,
  mockPersonalBalanceSummary,
  mockShoppingItems,
  mockTickets,
} from '../../data/mock'
import { appRoutes } from '../../routes/paths'

export function DashboardPage() {
  const { user } = useAuth()
  const { tasks } = useTasks()
  const myOpenTasks = tasks.filter(
    (task) => task.assignee_id === user?.id && isTaskIncomplete(task),
  )
  const openShopping = mockShoppingItems.filter((i) => i.status === 'open').length
  const openTickets = mockTickets.filter(
    (t) => t.status !== 'closed' && t.status !== 'cancelled',
  ).length

  return (
    <div className="page dashboard-home">
      <header className="home-hero">
        <div className="home-hero__top">
          <span className="home-hero__apt">{mockApartment.name}</span>
          <span className="home-hero__role">
            {user?.role === 'admin' ? 'דייר מנהל' : 'דייר'}
          </span>
        </div>
      </header>

      <section className="home-modules">
        <Link to={appRoutes.expenses} className="home-module home-module--primary">
          <div className="home-module__icon" aria-hidden="true">
            ₪
          </div>
          <div>
            <div className="home-module__title">הוצאות</div>
            <div className="home-module__subtitle">סיכום החודש</div>
          </div>
          <span className="home-module__meta">
            {mockPersonalBalanceSummary.monthExpensesTotal}
          </span>
        </Link>
        <Link to={appRoutes.tasks} className="home-module">
          <div className="home-module__icon" aria-hidden="true">
            ✓
          </div>
          <div>
            <div className="home-module__title">משימות</div>
            <div className="home-module__subtitle">פתוחות עבורך</div>
          </div>
          <span className="home-module__meta">{myOpenTasks.length}</span>
        </Link>
        <Link to={appRoutes.shopping} className="home-module">
          <div className="home-module__icon" aria-hidden="true">
            ק
          </div>
          <div>
            <div className="home-module__title">קניות</div>
            <div className="home-module__subtitle">ברשימה הפעילה</div>
          </div>
          <span className="home-module__meta">{openShopping}</span>
        </Link>
        <Link to={appRoutes.tickets} className="home-module">
          <div className="home-module__icon" aria-hidden="true">
            ב
          </div>
          <div>
            <div className="home-module__title">פניות</div>
            <div className="home-module__subtitle">לבעל הדירה</div>
          </div>
          <span className="home-module__meta">{openTickets}</span>
        </Link>
        <Link to={appRoutes.payments} className="home-module">
          <div className="home-module__icon" aria-hidden="true">
            ⇄
          </div>
          <div>
            <div className="home-module__title">תשלומים</div>
            <div className="home-module__subtitle">איזון בין דיירים</div>
          </div>
          <span className="home-module__meta">עדכון</span>
        </Link>
      </section>

      <section className="home-updates">
        <div className="home-updates__head">
          <h2>עדכונים אחרונים</h2>
          <Link to={appRoutes.tasks} className="link-quiet">
            לכל העדכונים
          </Link>
        </div>
        <ul className="home-updates__list">
          {mockNotifications.map((n) => (
            <li
              key={n.id}
              className={`home-updates__item home-updates__item--${n.tone}`}
            >
              <span className="home-updates__dot" aria-hidden="true" />
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
