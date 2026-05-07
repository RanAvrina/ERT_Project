import type { Expense, Payment } from '../../types/models'
import { usePersistentState } from '../../utils/storage'
import { storageKeys } from './storageKeys'

export function useExpensesStore() {
  return usePersistentState<Expense[]>(storageKeys.expenses, [])
}

export function usePaymentsStore() {
  return usePersistentState<Payment[]>(storageKeys.payments, [])
}
