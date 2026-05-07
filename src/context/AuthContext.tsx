/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import {
  useAccountsStore,
  useAuthSessionStore,
} from '../data/repositories/authRepository'
import { useApartment } from './ApartmentContext'
import type { AccountIdentity, AuthResult } from '../types/auth'
import type { User } from '../types/models'

interface AccountCreationResult {
  ok: boolean
  error: string
  account?: AccountIdentity
}

interface LoginInput {
  email: string
  password: string
  allowDetachedAccount?: boolean
}

interface RegisterInput {
  name: string
  phone: string
  email: string
  password: string
  role?: User['role']
  attachToApartment?: boolean
  signInAfterRegister?: boolean
}

interface AuthState {
  user: User | null
  login: (input: LoginInput) => AuthResult
  register: (input: RegisterInput) => AuthResult
  createAccountIdentity: (input: RegisterInput) => AccountCreationResult
  updateSessionUser: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { current, addUserAccount, addLandlord } = useApartment()
  const [accounts, setAccounts] = useAccountsStore()
  const users = useMemo(
    () =>
      current
        ? [
            ...current.roommates,
            ...(current.landlordUser ? [current.landlordUser] : []),
          ]
        : [],
    [current],
  )
  const [user, setUser] = useAuthSessionStore()

  useEffect(() => {
    if (!current?.credentialsByEmail) return

    const apartmentUsers = [
      current.adminUser,
      ...current.roommates,
      ...(current.landlordUser ? [current.landlordUser] : []),
    ]

    setAccounts((existingAccounts) => {
      let changed = false
      const nextAccounts = [...existingAccounts]

      Object.entries(current.credentialsByEmail).forEach(([email, password]) => {
        const normalizedEmail = normalizeEmail(email)
        const exists = nextAccounts.some(
          (account) => normalizeEmail(account.email) === normalizedEmail,
        )

        if (exists) return

        const matchedUser = apartmentUsers.find(
          (candidate) => normalizeEmail(candidate.email) === normalizedEmail,
        )

        nextAccounts.unshift({
          id: matchedUser?.id ?? Date.now() + nextAccounts.length,
          name: matchedUser?.name ?? normalizedEmail,
          email: normalizedEmail,
          phone: '',
          password,
        })
        changed = true
      })

      return changed ? nextAccounts : existingAccounts
    })
  }, [current, setAccounts])

  const persistUser = useCallback((nextUser: User | null) => {
    setUser(nextUser)
  }, [])

  const createAccountIdentity = useCallback(
    ({ name, phone, email, password }: RegisterInput): AccountCreationResult => {
      const normalizedEmail = normalizeEmail(email)

      if (!name.trim()) {
        return { ok: false, error: 'איך תרצו שהשם שלכם יופיע לשותפים?' }
      }

      if (!phone.trim()) {
        return { ok: false, error: 'נדרש מספר טלפון כדי להשלים את ההרשמה.' }
      }

      if (!normalizedEmail) {
        return { ok: false, error: 'נדרשת כתובת אימייל כדי ליצור חשבון.' }
      }

      if (password.trim().length < 6) {
        return { ok: false, error: 'הסיסמה צריכה לכלול לפחות 6 תווים.' }
      }

      const existingAccount = accounts.find(
        (account) => normalizeEmail(account.email) === normalizedEmail,
      )

      if (existingAccount) {
        return {
          ok: false,
          error: 'כבר קיים חשבון עם כתובת המייל הזו.',
        }
      }

      const nextAccount: AccountIdentity = {
        id: Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password,
      }

      setAccounts((currentAccounts) => [nextAccount, ...currentAccounts])
      return { ok: true, error: '', account: nextAccount }
    },
    [accounts, setAccounts],
  )

  const login = useCallback(
    ({ email, password, allowDetachedAccount = false }: LoginInput) => {
      const normalizedEmail = normalizeEmail(email)

      if (!normalizedEmail) {
        return { ok: false, error: 'נשמח לדעת עם איזו כתובת אימייל להתחבר.' }
      }

      if (!password.trim()) {
        return { ok: false, error: 'צריך להזין סיסמה כדי להמשיך.' }
      }

      const matchedMembership = users.find(
        (candidate) => normalizeEmail(candidate.email) === normalizedEmail,
      )
      const matchedAccount = accounts.find(
        (account) => normalizeEmail(account.email) === normalizedEmail,
      )

      if (!matchedAccount) {
        return {
          ok: false,
          error: 'לא מצאנו חשבון עם כתובת האימייל הזו.',
        }
      }

      if (matchedAccount.password !== password) {
        return {
          ok: false,
          error: 'כתובת האימייל או הסיסמה לא נכונות.',
        }
      }

      if (!matchedMembership && !allowDetachedAccount) {
        return {
          ok: false,
          error:
            'החשבון קיים, אבל לא משויך לדירה הפעילה. אפשר להצטרף דרך קישור הזמנה.',
        }
      }

      const nextUser =
        matchedMembership ??
        ({
          id: matchedAccount.id,
          apartment_id: current?.apartment.id ?? 0,
          name: matchedAccount.name,
          email: matchedAccount.email,
          role: 'tenant',
          status: 'active',
          joined_at: new Date().toISOString().slice(0, 10),
        } satisfies User)

      persistUser(nextUser)
      return { ok: true, error: '', user: nextUser }
    },
    [accounts, current, persistUser, users],
  )

  const register = useCallback(
    ({
      name,
      phone,
      email,
      password,
      role,
      attachToApartment = false,
      signInAfterRegister = attachToApartment,
    }: RegisterInput) => {
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

      const accountResult = createAccountIdentity({ name, phone, email, password, role })
      if (!accountResult.ok || !accountResult.account) {
        return {
          ok: false,
          error: accountResult.error || 'לא הצלחנו ליצור את החשבון.',
        }
      }

      const account = accountResult.account
      if (!attachToApartment) {
        const detachedUser: User = {
          id: account.id,
          apartment_id: 0,
          name: account.name,
          email: account.email,
          role: role ?? 'tenant',
          status: 'active',
          joined_at: new Date().toISOString().slice(0, 10),
        }

        if (signInAfterRegister) {
          persistUser(detachedUser)
        }

        return { ok: true, error: '', user: detachedUser }
      }

      const createdUser =
        role === 'landlord'
          ? addLandlord({ userId: account.id, name, email, phone, password })
          : addUserAccount({ userId: account.id, name, email, phone, password })

      const nextUser =
        createdUser ??
        ({
          id: account.id,
          apartment_id: current?.apartment.id ?? 0,
          name: name.trim(),
          email: normalizeEmail(email),
          role: role ?? 'tenant',
          status: 'active',
          joined_at: new Date().toISOString().slice(0, 10),
        } satisfies User)

      if (signInAfterRegister) {
        persistUser(nextUser)
      }

      return { ok: true, error: '', user: nextUser }
    },
    [addLandlord, addUserAccount, createAccountIdentity, current, persistUser],
  )

  const logout = useCallback(() => {
    persistUser(null)
  }, [persistUser])

  const updateSessionUser = useCallback(
    (nextUser: User) => {
      persistUser(nextUser)
    },
    [persistUser],
  )

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      createAccountIdentity,
      updateSessionUser,
      logout,
    }),
    [user, login, register, createAccountIdentity, updateSessionUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
