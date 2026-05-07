import type { ApartmentState } from '../../types/apartmentState'
import { usePersistentState } from '../../utils/storage'
import { storageKeys } from './storageKeys'

export function useApartmentStateStore() {
  return usePersistentState<ApartmentState | null>(storageKeys.apartment, null)
}

export function useApartmentsRegistryStore() {
  return usePersistentState<Record<number, ApartmentState>>(storageKeys.apartmentsRegistry, {})
}
