/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { mockApartment, mockUsers } from '../data/mock'
import type { Apartment, User } from '../types/models'

interface AdminContact {
  phone: string
}

interface RoommateContact {
  phone: string
}

interface LandlordContact {
  phone: string
}

interface ApartmentState {
  apartment: Apartment
  adminUser: User
  adminContact: AdminContact
  roommates: User[]
  roommateContacts: Record<number, RoommateContact>
  landlordUser: User | null
  landlordContact: LandlordContact | null
}

interface CreateApartmentInput {
  apartmentName: string
  adminName: string
  adminPhone: string
  adminEmail: string
}

interface ApartmentContextValue {
  current: ApartmentState | null
  createApartment: (input: CreateApartmentInput) => ApartmentState
  addRoommate: (input: AddRoommateInput) => ApartmentState | null
  removeRoommate: (roommateId: number) => ApartmentState | null
  addUserAccount: (input: AddUserAccountInput) => User | null
  addLandlord: (input: AddLandlordInput) => User | null
}

interface AddRoommateInput {
  name: string
  email: string
  phone: string
}

interface AddUserAccountInput {
  name: string
  email: string
  phone: string
  role?: User['role']
}

interface AddLandlordInput {
  name: string
  email: string
  phone: string
}

const ApartmentContext = createContext<ApartmentContextValue | null>(null)

function buildInitialState(): ApartmentState {
  const adminUser = mockUsers.find((user) => user.role === 'admin') ?? mockUsers[0]
  const roommateContacts: Record<number, RoommateContact> = {}
  mockUsers.forEach((user) => {
    roommateContacts[user.id] = { phone: '' }
  })
  return {
    apartment: mockApartment,
    adminUser,
    adminContact: { phone: '' },
    roommates: mockUsers,
    roommateContacts,
    landlordUser: null,
    landlordContact: null,
  }
}

export function ApartmentProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ApartmentState | null>(buildInitialState)

  const createApartment = useCallback((input: CreateApartmentInput) => {
    const nextApartment: Apartment = {
      id: Date.now(),
      name: input.apartmentName.trim(),
      is_active: true,
    }

    const nextAdmin: User = {
      id: Date.now() + 1,
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
    }

    setCurrent(nextState)
    return nextState
  }, [])

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

      const nextState: ApartmentState = {
        ...current,
        roommates: [nextUser, ...current.roommates],
        roommateContacts: {
          ...current.roommateContacts,
          [nextId]: { phone: input.phone.trim() },
        },
      }

      setCurrent(nextState)
      return nextState
    },
    [current],
  )

  const removeRoommate = useCallback(
    (roommateId: number) => {
      if (!current) return null
      if (roommateId === current.adminUser.id) return current

      const nextState: ApartmentState = {
        ...current,
        roommates: current.roommates.map((roommate) =>
          roommate.id === roommateId ? { ...roommate, status: 'inactive' } : roommate,
        ),
      }

      setCurrent(nextState)
      return nextState
    },
    [current],
  )

  const addUserAccount = useCallback(
    (input: AddUserAccountInput) => {
      if (!current) return null
      const nextId = Date.now()
      const nextUser: User = {
        id: nextId,
        apartment_id: current.apartment.id,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role ?? 'tenant',
        status: 'active',
        joined_at: new Date().toISOString().slice(0, 10),
      }

      const nextState: ApartmentState = {
        ...current,
        roommates: [nextUser, ...current.roommates],
        roommateContacts: {
          ...current.roommateContacts,
          [nextId]: { phone: input.phone.trim() },
        },
      }

      setCurrent(nextState)
      return nextUser
    },
    [current],
  )

  const addLandlord = useCallback(
    (input: AddLandlordInput) => {
      if (!current) return null
      const nextId = Date.now()
      const nextUser: User = {
        id: nextId,
        apartment_id: current.apartment.id,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: 'landlord',
        status: 'active',
        joined_at: new Date().toISOString().slice(0, 10),
      }

      const nextState: ApartmentState = {
        ...current,
        landlordUser: nextUser,
        landlordContact: { phone: input.phone.trim() },
      }

      setCurrent(nextState)
      return nextUser
    },
    [current],
  )

  const value = useMemo(
    () => ({
      current,
      createApartment,
      addRoommate,
      removeRoommate,
      addUserAccount,
      addLandlord,
    }),
    [current, createApartment, addRoommate, removeRoommate, addUserAccount, addLandlord],
  )

  return <ApartmentContext.Provider value={value}>{children}</ApartmentContext.Provider>
}

export function useApartment() {
  const ctx = useContext(ApartmentContext)
  if (!ctx) throw new Error('useApartment must be used within ApartmentProvider')
  return ctx
}
