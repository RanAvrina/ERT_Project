import { Link, Outlet } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { appRoutes } from '../routes/paths'
import { useApartment } from '../context/ApartmentContext'

export function AppLayout() {
  const { user, logout } = useAuth()
  const { current } = useApartment()
  const apartmentName = current?.apartment.name ?? 'הדירה המשותפת'

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="top-bar__brand">
          <span className="top-bar__logo">ERT</span>
          <div className="top-bar__titles">
            <span className="top-bar__apt">{apartmentName}</span>
            {user && (
              <span className="top-bar__user">שלום, {user.name}</span>
            )}
          </div>
        </div>
        <div className="top-bar__actions">
          {user?.role === 'landlord' ? null : (
            <Link to={appRoutes.roommates} className="link-quiet">
              דיירים
            </Link>
          )}
          <button type="button" className="btn-text" onClick={logout}>
            יציאה
          </button>
        </div>
      </header>

      <main className="main-scroll">
        <div className="page-shell">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
