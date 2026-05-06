import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AppLayout } from './layouts/AppLayout'
import { DashboardPage } from './pages/Dashboard'
import { ExpensesPage } from './pages/Expenses'
import { LoginPage } from './pages/Login'
import { PaymentsPage } from './pages/Payments'
import { RegisterPage } from './pages/Register'
import { RoommatesPage } from './pages/Roommates'
import { ShoppingPage } from './pages/Shopping'
import { TasksPage } from './pages/Tasks'
import { CreateApartmentPage } from './pages/CreateApartment'
import { JoinApartmentPage } from './pages/JoinApartment'
import { TicketDetailPage } from './pages/Tickets/Detail'
import { TicketsPage } from './pages/Tickets'
import { appRoutes } from './routes/paths'

function RequireAuth({ children }: { children: ReactElement }) {
  const { user } = useAuth()
  if (!user) return <Navigate to={appRoutes.login} replace />
  return children
}

function RoleGate({
  children,
  allowLandlord = false,
}: {
  children: ReactElement
  allowLandlord?: boolean
}) {
  const { user } = useAuth()
  if (!user) return <Navigate to={appRoutes.login} replace />
  if (user.role === 'landlord' && !allowLandlord) {
    return <Navigate to={appRoutes.tickets} replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path={appRoutes.login} element={<LoginPage />} />
      <Route path={appRoutes.register} element={<RegisterPage />} />
      <Route path={appRoutes.createApartment} element={<CreateApartmentPage />} />
      <Route path={appRoutes.joinApartment} element={<JoinApartmentPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route
          path={appRoutes.dashboard}
          element={
            <RoleGate>
              <DashboardPage />
            </RoleGate>
          }
        />
        <Route
          path={appRoutes.expenses}
          element={
            <RoleGate>
              <ExpensesPage />
            </RoleGate>
          }
        />
        <Route
          path={appRoutes.payments}
          element={
            <RoleGate>
              <PaymentsPage />
            </RoleGate>
          }
        />
        <Route
          path={appRoutes.tasks}
          element={
            <RoleGate>
              <TasksPage />
            </RoleGate>
          }
        />
        <Route
          path={appRoutes.shopping}
          element={
            <RoleGate>
              <ShoppingPage />
            </RoleGate>
          }
        />
        <Route
          path={appRoutes.tickets}
          element={
            <RoleGate allowLandlord>
              <TicketsPage />
            </RoleGate>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <RoleGate allowLandlord>
              <TicketDetailPage />
            </RoleGate>
          }
        />
        <Route
          path={appRoutes.roommates}
          element={
            <RoleGate>
              <RoommatesPage />
            </RoleGate>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={appRoutes.dashboard} replace />} />
    </Routes>
  )
}
