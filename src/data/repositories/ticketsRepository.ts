import type { TicketComment } from '../../types/models'
import type { TicketWithAttachments } from '../../context/TicketsContext'
import { usePersistentState } from '../../utils/storage'
import { storageKeys } from './storageKeys'

export function useTicketsStore() {
  return usePersistentState<TicketWithAttachments[]>(storageKeys.tickets, [])
}

export function useTicketCommentsStore() {
  return usePersistentState<TicketComment[]>(storageKeys.ticketComments, [])
}
