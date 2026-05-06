/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { mockUsers } from '../data/mock'
import { useApartment } from './ApartmentContext'
import type { User } from '../types/models'

const storageKey = 'ert_demo_auth_user'

interface AuthResult {
  ok: boolean
  error: string
}

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  name: string
  phone: string
  email: string
  password: string
}

interface AuthState {
  user: User | null
  login: (input: LoginInput) => AuthResult
  register: (input: RegisterInput) => AuthResult
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { current, addUserAccount } = useApartment()
  const users = useMemo(
    () =>
      current
        ? [
            ...current.roommates,
            ...(current.landlordUser ? [current.landlordUser] : []),
          ]
        : mockUsers,
    [current],
  )
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null

    const storedUser = window.sessionStorage.getItem(storageKey)
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as User
      } catch {
        window.sessionStorage.removeItem(storageKey)
      }
    }

    return null
  })

  const persistUser = useCallback((nextUser: User | null) => {
    setUser(nextUser)

    if (nextUser) {
      window.sessionStorage.setItem(storageKey, JSON.stringify(nextUser))
      window.sessionStorage.setItem('ert_demo_auth', '1')
      return
    }

    window.sessionStorage.removeItem(storageKey)
    window.sessionStorage.removeItem('ert_demo_auth')
  }, [])

  const login = useCallback(
    ({ email, password }: LoginInput) => {
      const normalizedEmail = email.trim().toLowerCase()

      if (!normalizedEmail) {
        return { ok: false, error: 'נשמח לדעת עם איזו כתובת אימייל להתחבר.' }
      }

      if (!password.trim()) {
        return { ok: false, error: 'צריך להזין סיסמה כדי להמשיך.' }
      }

      const matchedUser = users.find(
        (u) => u.email.toLowerCase() === normalizedEmail,
      )
      if (!matchedUser) {
        return {
          ok: false,
          error:
            'לא מצאנו חשבון דמו עם הכתובת הזו. אפשר לבחור חשבון מהרשימה או להירשם.',
        }
      }

      persistUser(matchedUser)
      return { ok: true, error: '' }
    },
    [persistUser, users],
  )

  const register = useCallback(
    ({ name, phone, email, password }: RegisterInput) => {
      if (!name.trim()) {
        return { ok: false, error: 'איך תרצו שהשם שלכם יופיע לשותפים?' }
      }

      if (!phone.trim()) {
        return { ok: false, error: 'נדרש מספר טלפון כדי להשלים את ההרשמה.' }
      }

      if (!email.trim()) {
        return { ok: false, error: 'נדרשת כתובת אימייל כדי ליצור חשבון.' }
      }

      if (password.trim().length < 6) {
        return { ok: false, error: 'הסיסמה צריכה לכלול לפחות 6 תווים.' }
      }

      const nextUser =
        addUserAccount({
          name,
          email,
          phone,
        }) ??
        ({
          id: Date.now(),
          apartment_id: 1,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: 'tenant',
          status: 'active',
          joined_at: new Date().toISOString().slice(0, 10),
        } satisfies User)

      persistUser(nextUser)
      return { ok: true, error: '' }
    },
    [addUserAccount, persistUser],
  )

  const logout = useCallback(() => {
    persistUser(null)
  }, [persistUser])

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
