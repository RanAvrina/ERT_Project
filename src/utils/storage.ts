import { useEffect, useState } from 'react'
import { persistenceAdapter } from '../data/persistence'
export { storageKeys } from '../data/repositories/storageKeys'
import { storageKeys } from '../data/repositories/storageKeys'

const demoStorageKeys = Object.values(storageKeys)

export function readStorage<T>(key: string, fallback: T): T {
  return persistenceAdapter.read(key, fallback)
}

export function writeStorage<T>(key: string, value: T) {
  persistenceAdapter.write(key, value)
}

export function removeStorage(key: string) {
  persistenceAdapter.remove(key)
}

export function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback))

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  return [value, setValue] as const
}

export function resetDemoStorage() {
  if (typeof window === 'undefined') return
  demoStorageKeys.forEach((key) => window.localStorage.removeItem(key))
  window.sessionStorage.removeItem(storageKeys.authUser)
  window.sessionStorage.removeItem('ert_demo_auth')
}
