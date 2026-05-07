import type { Task } from '../../types/models'
import { usePersistentState } from '../../utils/storage'
import { storageKeys } from './storageKeys'

export function useTasksStore() {
  return usePersistentState<Task[]>(storageKeys.tasks, [])
}
