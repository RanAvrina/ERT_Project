import type { ApartmentInfoItem } from '../../types/models'
import { usePersistentState } from '../../utils/storage'
import { storageKeys } from './storageKeys'

export function useApartmentInfoStore() {
  return usePersistentState<ApartmentInfoItem[]>(storageKeys.apartmentInfo, [])
}
