import type { PendingInvite } from '../../utils/invite'
import { readStorage, removeStorage, writeStorage } from '../../utils/storage'
import { storageKeys } from './storageKeys'

export function savePendingInviteRecord(invite: PendingInvite) {
  writeStorage(storageKeys.pendingInvite, invite)
}

export function readPendingInviteRecord() {
  return readStorage<PendingInvite | null>(storageKeys.pendingInvite, null)
}

export function clearPendingInviteRecord() {
  removeStorage(storageKeys.pendingInvite)
}
