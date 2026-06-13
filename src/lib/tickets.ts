import type { Ticket, TicketComment, TicketPriority, TicketStatus, UserRole } from '@/types'
import {
  createCommentId,
  createTicketId,
  seedTicketComments,
  seedTickets,
} from '@/mocks/seedTickets'

const TICKETS_KEY = 'tickets'
const COMMENTS_KEY = 'ticket-comments'
const DELETED_TICKETS_KEY = 'deleted-ticket-ids'

function readJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeJson<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value))
}

function readIdSet(key: string) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set<string>()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set<string>()
  }
}

function writeIdSet(key: string, ids: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...ids]))
}

export function getAllTickets() {
  const deleted = readIdSet(DELETED_TICKETS_KEY)
  const stored = readJson<Ticket>(TICKETS_KEY)
  const storedIds = new Set(stored.map((item) => item.id))
  const seed = seedTickets.filter((item) => !deleted.has(item.id) && !storedIds.has(item.id))
  return [...stored.filter((item) => !deleted.has(item.id)), ...seed].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export function getAllTicketComments() {
  const stored = readJson<TicketComment>(COMMENTS_KEY)
  const storedIds = new Set(stored.map((item) => item.id))
  const seed = seedTicketComments.filter((item) => !storedIds.has(item.id))
  return [...stored, ...seed].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

export function getTicketById(id: string) {
  return getAllTickets().find((ticket) => ticket.id === id)
}

export function getCommentsForTicket(ticketId: string) {
  return getAllTicketComments().filter((comment) => comment.ticketId === ticketId)
}

export function getTicketsForUser(userId: string, role: UserRole) {
  const tickets = getAllTickets()
  if (role === 'admin') return tickets
  if (role === 'teacher') return tickets.filter((ticket) => ticket.createdById === userId)
  return []
}

export interface CreateTicketInput {
  title: string
  description: string
  priority: TicketPriority
  createdById: string
  createdByRole: 'teacher' | 'admin' | 'parent'
  studentId?: string
}

export function createTicket(input: CreateTicketInput) {
  const now = new Date().toISOString()
  const ticket: Ticket = {
    id: createTicketId(),
    title: input.title.trim(),
    description: input.description.trim(),
    status: 'open',
    priority: input.priority,
    createdById: input.createdById,
    createdByRole: input.createdByRole,
    studentId: input.studentId,
    createdAt: now,
    updatedAt: now,
  }
  const stored = readJson<Ticket>(TICKETS_KEY)
  stored.unshift(ticket)
  writeJson(TICKETS_KEY, stored)
  return ticket
}

export function updateTicketStatus(ticketId: string, status: TicketStatus, assignedToId?: string) {
  const stored = readJson<Ticket>(TICKETS_KEY)
  const index = stored.findIndex((item) => item.id === ticketId)
  const now = new Date().toISOString()

  if (index >= 0) {
    stored[index] = {
      ...stored[index],
      status,
      assignedToId: assignedToId ?? stored[index].assignedToId,
      updatedAt: now,
    }
    writeJson(TICKETS_KEY, stored)
    return stored[index]
  }

  const seedIndex = seedTickets.findIndex((item) => item.id === ticketId)
  if (seedIndex < 0) throw new Error('ticket_not_found')

  const updated: Ticket = {
    ...seedTickets[seedIndex],
    status,
    assignedToId: assignedToId ?? seedTickets[seedIndex].assignedToId,
    updatedAt: now,
  }
  stored.unshift(updated)
  writeJson(TICKETS_KEY, stored)
  return updated
}

export function addTicketComment(input: {
  ticketId: string
  authorId: string
  authorRole: UserRole
  body: string
}) {
  const trimmed = input.body.trim()
  if (!trimmed) throw new Error('empty_comment')

  const comment: TicketComment = {
    id: createCommentId(),
    ticketId: input.ticketId,
    authorId: input.authorId,
    authorRole: input.authorRole,
    body: trimmed,
    createdAt: new Date().toISOString(),
  }

  const storedComments = readJson<TicketComment>(COMMENTS_KEY)
  storedComments.push(comment)
  writeJson(COMMENTS_KEY, storedComments)

  updateTicketStatus(input.ticketId, getTicketById(input.ticketId)?.status ?? 'open')

  return comment
}

export function deleteTicket(ticketId: string) {
  const stored = readJson<Ticket>(TICKETS_KEY)
  const next = stored.filter((item) => item.id !== ticketId)
  if (next.length !== stored.length) {
    writeJson(TICKETS_KEY, next)
    return
  }
  const deleted = readIdSet(DELETED_TICKETS_KEY)
  deleted.add(ticketId)
  writeIdSet(DELETED_TICKETS_KEY, deleted)
}
