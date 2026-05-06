import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApartmentProvider } from './context/ApartmentContext'
import { AuthProvider } from './context/AuthContext'
import { ExpensesProvider } from './context/ExpensesContext'
import { TasksProvider } from './context/TasksContext'
import { TicketsProvider } from './context/TicketsContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ApartmentProvider>
        <AuthProvider>
          <ExpensesProvider>
            <TasksProvider>
              <TicketsProvider>
                <App />
              </TicketsProvider>
            </TasksProvider>
          </ExpensesProvider>
        </AuthProvider>
      </ApartmentProvider>
    </BrowserRouter>
  </StrictMode>,
)
