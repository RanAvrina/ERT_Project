import { isDatabaseMode } from './config'
import { localStorageAdapter } from './localStorageAdapter'
import type { PersistenceAdapter } from './types'

const databaseAdapterPlaceholder: PersistenceAdapter = {
  read<T>(_key: string, fallback: T): T {
    return fallback
  },
  write<T>(_key: string, _value: T) {},
  remove(_key: string) {},
}

export const persistenceAdapter: PersistenceAdapter = isDatabaseMode
  ? databaseAdapterPlaceholder
  : localStorageAdapter
