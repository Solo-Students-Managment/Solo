import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Ticket, TicketComment, TicketStatus, UserRole } from '@/types';
import {
  addTicketComment,
  createTicket,
  deleteTicket,
  getAllTickets,
  getCommentsForTicket,
  getTicketById,
  getTicketsForUser,
  updateTicketStatus,
  type CreateTicketInput,
} from '@/lib/tickets';

interface TicketContextValue {
  version: number;
  tickets: Ticket[];
  getTicketsForUser: (userId: string, role: UserRole) => Ticket[];
  getTicket: (ticketId: string) => Ticket | undefined;
  getComments: (ticketId: string) => TicketComment[];
  createTicket: (input: CreateTicketInput) => Ticket;
  updateStatus: (ticketId: string, status: TicketStatus, assignedToId?: string) => Ticket;
  addComment: (input: {
    ticketId: string;
    authorId: string;
    authorRole: UserRole;
    body: string;
  }) => TicketComment;
  deleteTicket: (ticketId: string) => void;
}

const TicketContext = createContext<TicketContextValue | null>(null);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((current) => current + 1), []);

  const tickets = useMemo(() => {
    void version;
    return getAllTickets();
  }, [version]);

  const value = useMemo<TicketContextValue>(
    () => ({
      version,
      tickets,
      getTicketsForUser: (userId, role) => getTicketsForUser(userId, role),
      getTicket: (ticketId) => getTicketById(ticketId),
      getComments: (ticketId) => getCommentsForTicket(ticketId),
      createTicket: (input) => {
        const ticket = createTicket(input);
        bump();
        return ticket;
      },
      updateStatus: (ticketId, status, assignedToId) => {
        const ticket = updateTicketStatus(ticketId, status, assignedToId);
        bump();
        return ticket;
      },
      addComment: (input) => {
        const comment = addTicketComment(input);
        bump();
        return comment;
      },
      deleteTicket: (ticketId) => {
        deleteTicket(ticketId);
        bump();
      },
    }),
    [version, tickets, bump]
  );

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within TicketProvider');
  }
  return context;
}
