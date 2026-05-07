import type { ShoppingItem } from '../../types/models'
import { usePersistentState } from '../../utils/storage'
import { storageKeys } from './storageKeys'

export function useShoppingItemsStore() {
  return usePersistentState<ShoppingItem[]>(storageKeys.shoppingItems, [])
}
