import type { AccountIdentity } from '../../types/auth'
import type { User } from '../../types/models'
import { usePersistentState } from '../../utils/storage'
import { storageKeys } from './storageKeys'

export function useAccountsStore() {
  return usePersistentState<AccountIdentity[]>(storageKeys.accounts, [])
}

export function useAuthSessionStore() {
  return usePersistentState<User | null>(storageKeys.authUser, null)
}
