import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { mockTicketComments, mockTickets } from '../data/mock'
import type {
  MaintenanceTicket,
  TicketCategory,
  TicketComment,
  TicketStatus,
} from '../types/models'

/* eslint-disable react-refresh/only-export-components */

export interface TicketAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

export interface TicketWithAttachments extends MaintenanceTicket {
  attachments: TicketAttachment[]
}

interface NewTicketInput {
  title: string
  description: string
  category: TicketCategory
  createdBy: number
  apartmentId: number
  attachments: TicketAttachment[]
}

interface TicketsContextValue {
  tickets: TicketWithAttachments[]
  comments: TicketComment[]
  addTicket: (ticket: NewTicketInput) => TicketWithAttachments
  addComment: (ticketId: number, userId: number, text: string) => TicketComment
  updateTicketStatus: (ticketId: number, status: TicketStatus) => void
  getTicketById: (id: string | number | undefined) => TicketWithAttachments | undefined
  getCommentsByTicketId: (ticketId: number) => TicketComment[]
}

const TicketsContext = createContext<TicketsContextValue | null>(null)

const initialTickets: TicketWithAttachments[] = mockTickets.map((ticket) => ({
  ...ticket,
  attachments: [],
}))

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<TicketWithAttachments[]>(initialTickets)
  const [comments, setComments] = useState<TicketComment[]>(mockTicketComments)

  function addTicket(input: NewTicketInput) {
    const nextId =
      tickets.length > 0 ? Math.max(...tickets.map((ticket) => ticket.id)) + 1 : 1
    const ticket: TicketWithAttachments = {
      id: nextId,
      apartment_id: input.apartmentId,
      title: input.title,
      description: input.description,
      category: input.category,
      status: 'open',
      created_by: input.createdBy,
      created_at: new Date().toISOString(),
      attachments: input.attachments,
    }

    setTickets((current) => [ticket, ...current])
    return ticket
  }

  function addComment(ticketId: number, userId: number, text: string) {
    let created: TicketComment | null = null

    setComments((current) => {
      const nextId = current.length > 0 ? Math.max(...current.map((c) => c.id)) + 1 : 1
      created = {
        id: nextId,
        ticket_id: ticketId,
        user_id: userId,
        comment_text: text.trim(),
        created_at: new Date().toISOString(),
      }
      return created ? [created, ...current] : current
    })

    if (!created) {
      created = {
        id: Date.now(),
        ticket_id: ticketId,
        user_id: userId,
        comment_text: text.trim(),
        created_at: new Date().toISOString(),
      }
    }

    return created
  }

  function updateTicketStatus(ticketId: number, status: TicketStatus) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status } : ticket,
      ),
    )
  }

  function getTicketById(id: string | number | undefined) {
    return tickets.find((ticket) => String(ticket.id) === String(id))
  }

  function getCommentsByTicketId(ticketId: number) {
    return comments.filter((comment) => comment.ticket_id === ticketId)
  }

  return (
    <TicketsContext.Provider
      value={{
        tickets,
        comments,
        addTicket,
        addComment,
        updateTicketStatus,
        getTicketById,
        getCommentsByTicketId,
      }}
    >
      {children}
    </TicketsContext.Provider>
  )
}

export function useTickets() {
  const context = useContext(TicketsContext)
  if (!context) {
    throw new Error('useTickets must be used within TicketsProvider')
  }
  return context
}
