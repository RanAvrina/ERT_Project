import type { PersistenceMode } from './types'

const requestedMode = import.meta.env.VITE_PERSISTENCE_MODE

export const persistenceMode: PersistenceMode =
  requestedMode === 'database' ? 'database' : 'localStorage'

export const isDatabaseMode = persistenceMode === 'database'
