/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import type { Apartment, User } from '../types/models'
import type {
  AddLandlordInput,
  AddRoommateInput,
  AddUserAccountInput,
  ApartmentState,
  CreateApartmentInput,
} from '../types/apartmentState'
import type { InviteRole } from '../utils/invite'
import {
  useApartmentsRegistryStore,
  useApartmentStateStore,
} from '../data/repositories/apartmentRepository'

interface ApartmentContextValue {
  current: ApartmentState | null
  getApartmentById: (apartmentId: number) => ApartmentState | null
  createApartment: (input: CreateApartmentInput) => ApartmentState
  addRoommate: (input: AddRoommateInput) => ApartmentState | null
  removeRoommate: (roommateId: number) => ApartmentState | null
  addUserAccount: (input: AddUserAccountInput) => User | null
  addLandlord: (input: AddLandlordInput) => User | null
  completeInviteJoin: (input: CompleteInviteJoinInput) => CompleteInviteJoinResult
}

interface CompleteInviteJoinInput {
  apartmentId: number
  role: InviteRole
  user: User
}

interface CompleteInviteJoinResult {
  ok: boolean
  user: User | null
  error: string
}

interface ExistingMembership {
  apartmentId: number
  apartmentName: string
  role: User['role']
  user: User
}

const ApartmentContext = createContext<ApartmentContextValue | null>(null)

function findExistingMembership(
  registry: Record<number, ApartmentState>,
  user: User,
): ExistingMembership | null {
  const normalizedEmail = user.email.trim().toLowerCase()

  for (const apartmentState of Object.values(registry)) {
    const candidates: User[] = [
      apartmentState.adminUser,
      ...apartmentState.roommates,
      ...(apartmentState.landlordUser ? [apartmentState.landlordUser] : []),
    ]

    const match = candidates.find(
      (candidate) =>
        candidate.id === user.id || candidate.email.trim().toLowerCase() === normalizedEmail,
    )

    if (match) {
      return {
        apartmentId: apartmentState.apartment.id,
        apartmentName: apartmentState.apartment.name,
        role: match.role,
        user: match,
      }
    }
  }

  return null
}

export function ApartmentProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useApartmentStateStore()
  const [apartmentsRegistry, setApartmentsRegistry] = useApartmentsRegistryStore()

  const persistApartmentState = useCallback(
    (nextState: ApartmentState) => {
      setCurrent(nextState)
      setApartmentsRegistry((currentRegistry) => ({
        ...currentRegistry,
        [nextState.apartment.id]: nextState,
      }))
      return nextState
    },
    [setApartmentsRegistry, setCurrent],
  )

  const getApartmentById = useCallback(
    (apartmentId: number) => apartmentsRegistry[apartmentId] ?? null,
    [apartmentsRegistry],
  )

  useEffect(() => {
    if (!current) return

    setApartmentsRegistry((currentRegistry) => {
      const existingState = currentRegistry[current.apartment.id]
      if (existingState) return currentRegistry

      return {
        ...currentRegistry,
        [current.apartment.id]: current,
      }
    })
  }, [current, setApartmentsRegistry])

  const createApartment = useCallback(
    (input: CreateApartmentInput) => {
      const nextApartment: Apartment = {
        id: Date.now(),
        name: input.apartmentName.trim(),
        is_active: true,
      }

      const nextAdmin: User = {
        id: input.adminUserId ?? Date.now() + 1,
        apartment_id: nextApartment.id,
        name: input.adminName.trim(),
        email: input.adminEmail.trim().toLowerCase(),
        role: 'admin',
        status: 'active',
        joined_at: new Date().toISOString().slice(0, 10),
      }

      const nextState: ApartmentState = {
        apartment: nextApartment,
        adminUser: nextAdmin,
        adminContact: { phone: input.adminPhone.trim() },
        roommates: [nextAdmin],
        roommateContacts: {
          [nextAdmin.id]: { phone: input.adminPhone.trim() },
        },
        landlordUser: null,
        landlordContact: null,
        credentialsByEmail: {
          [nextAdmin.email]: input.adminPassword,
        },
      }

      return persistApartmentState(nextState)
    },
    [persistApartmentState],
  )

  const addRoommate = useCallback(
    (input: AddRoommateInput) => {
      if (!current) return null
      const nextId = Date.now()
      const nextUser: User = {
        id: nextId,
        apartment_id: current.apartment.id,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: 'tenant',
        status: 'active',
        joined_at: new Date().toISOString().slice(0, 10),
      }

      return persistApartmentState({
        ...current,
        roommates: [nextUser, ...current.roommates],
        roommateContacts: {
          ...current.roommateContacts,
          [nextId]: { phone: input.phone.trim() },
        },
        credentialsByEmail: current.credentialsByEmail ?? {},
      })
    },
    [current, persistApartmentState],
  )

  const removeRoommate = useCallback(
    (roommateId: number) => {
      if (!current) return null
      if (roommateId === current.adminUser.id) return current

      return persistApartmentState({
        ...current,
        roommates: current.roommates.map((roommate) =>
          roommate.id === roommateId ? { ...roommate, status: 'inactive' } : roommate,
        ),
      })
    },
    [current, persistApartmentState],
  )

  const addUserAccount = useCallback(
    (input: AddUserAccountInput) => {
      if (!current) return null
      const nextId = input.userId ?? Date.now()
      const nextUser: User = {
        id: nextId,
        apartment_id: current.apartment.id,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role ?? 'tenant',
        status: 'active',
        joined_at: new Date().toISOString().slice(0, 10),
      }

      persistApartmentState({
        ...current,
        roommates: [nextUser, ...current.roommates],
        roommateContacts: {
          ...current.roommateContacts,
          [nextId]: { phone: input.phone.trim() },
        },
        credentialsByEmail: input.password
          ? {
              ...(current.credentialsByEmail ?? {}),
              [nextUser.email]: input.password,
            }
          : current.credentialsByEmail ?? {},
      })

      return nextUser
    },
    [current, persistApartmentState],
  )

  const addLandlord = useCallback(
    (input: AddLandlordInput) => {
      if (!current) return null
      const nextId = input.userId ?? Date.now()
      const nextUser: User = {
        id: nextId,
        apartment_id: current.apartment.id,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: 'landlord',
        status: 'active',
        joined_at: new Date().toISOString().slice(0, 10),
      }

      persistApartmentState({
        ...current,
        landlordUser: nextUser,
        landlordContact: { phone: input.phone.trim() },
        credentialsByEmail: input.password
          ? {
              ...(current.credentialsByEmail ?? {}),
              [nextUser.email]: input.password,
            }
          : current.credentialsByEmail ?? {},
      })

      return nextUser
    },
    [current, persistApartmentState],
  )

  const completeInviteJoin = useCallback(
    ({ apartmentId, role, user }: CompleteInviteJoinInput): CompleteInviteJoinResult => {
      const targetApartmentState = apartmentsRegistry[apartmentId] ?? null

      if (!targetApartmentState) {
        return {
          ok: false,
          user: null,
          error: 'לא נמצאה דירה זמינה להצטרפות מהקישור הזה.',
        }
      }

      const normalizedEmail = user.email.trim().toLowerCase()
      const existingMembership = findExistingMembership(apartmentsRegistry, user)

      if (existingMembership && existingMembership.apartmentId !== targetApartmentState.apartment.id) {
        return {
          ok: false,
          user: null,
          error: `החשבון כבר משויך לדירה אחרת: ${existingMembership.apartmentName}. אי אפשר לשייך אותו לדירה נוספת.`,
        }
      }

      if (
        existingMembership &&
        existingMembership.apartmentId === targetApartmentState.apartment.id &&
        existingMembership.role !== role
      ) {
        const roleLabel =
          existingMembership.role === 'admin'
            ? 'מנהל דירה'
            : existingMembership.role === 'landlord'
              ? 'בעל דירה'
              : 'דייר'

        return {
          ok: false,
          user: null,
          error: `החשבון כבר משויך לדירה הזו בתפקיד ${roleLabel}. אי אפשר לשנות אותו דרך קישור הזמנה אחר.`,
        }
      }

      if (role === 'landlord') {
        if (
          targetApartmentState.landlordUser &&
          targetApartmentState.landlordUser.email.toLowerCase() !== normalizedEmail
        ) {
          return {
            ok: false,
            user: null,
            error: 'כבר משויך בעל דירה אחר לדירה הזו. צריך להסיר או לעדכן אותו לפני שליחת הזמנה חדשה.',
          }
        }

        const nextLandlord: User = {
          ...(existingMembership?.user ?? user),
          apartment_id: targetApartmentState.apartment.id,
          email: normalizedEmail,
          role: 'landlord',
          status: 'active',
        }

        const nextState: ApartmentState = {
          ...targetApartmentState,
          landlordUser: nextLandlord,
          landlordContact:
            targetApartmentState.landlordUser?.email.toLowerCase() === normalizedEmail
              ? targetApartmentState.landlordContact
              : targetApartmentState.landlordContact ?? { phone: '' },
          roommates: targetApartmentState.roommates.filter(
            (roommate) => roommate.email.toLowerCase() !== normalizedEmail,
          ),
        }

        persistApartmentState(nextState)
        return { ok: true, user: nextLandlord, error: '' }
      }

      const existingRoommate = targetApartmentState.roommates.find(
        (roommate) => roommate.email.toLowerCase() === normalizedEmail,
      )

      const nextTenant: User = {
        ...(existingRoommate ?? existingMembership?.user ?? user),
        apartment_id: targetApartmentState.apartment.id,
        email: normalizedEmail,
        role: 'tenant',
        status: 'active',
      }

      const nextState: ApartmentState = {
        ...targetApartmentState,
        roommates: existingRoommate
          ? targetApartmentState.roommates.map((roommate) =>
              roommate.id === existingRoommate.id ? nextTenant : roommate,
            )
          : [nextTenant, ...targetApartmentState.roommates],
        roommateContacts: {
          ...targetApartmentState.roommateContacts,
          [nextTenant.id]: targetApartmentState.roommateContacts[nextTenant.id] ?? { phone: '' },
        },
      }

      persistApartmentState(nextState)
      return { ok: true, user: nextTenant, error: '' }
    },
    [apartmentsRegistry, persistApartmentState],
  )

  const value = useMemo(
    () => ({
      current,
      getApartmentById,
      createApartment,
      addRoommate,
      removeRoommate,
      addUserAccount,
      addLandlord,
      completeInviteJoin,
    }),
    [
      current,
      getApartmentById,
      createApartment,
      addRoommate,
      removeRoommate,
      addUserAccount,
      addLandlord,
      completeInviteJoin,
    ],
  )

  return <ApartmentContext.Provider value={value}>{children}</ApartmentContext.Provider>
}

export function useApartment() {
  const ctx = useContext(ApartmentContext)
  if (!ctx) throw new Error('useApartment must be used within ApartmentProvider')
  return ctx
}
