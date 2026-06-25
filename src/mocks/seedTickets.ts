import type { Ticket, TicketComment, TicketPriority, TicketStatus } from '@/types';
import { DEMO_TEACHER_ID } from '@/mocks/seedUsers';

export const seedTickets: Ticket[] = [
  {
    id: 'ticket-1',
    title: 'درخواست جلسه جبرانی',
    description: 'زبان‌آموز هفته گذشته غایب بود. لطفاً زمان جلسه جبرانی هماهنگ شود.',
    status: 'open',
    priority: 'high',
    createdById: DEMO_TEACHER_ID,
    createdByRole: 'teacher',
    studentId: 'user-student-1',
    createdAt: '2025-04-26T10:00:00',
    updatedAt: '2025-04-26T10:00:00',
  },
  {
    id: 'ticket-2',
    title: 'مشکل ورود به پنل',
    description: 'ولی زبان‌آموز نمی‌تواند وارد پنل شود.',
    status: 'in_progress',
    priority: 'medium',
    createdById: DEMO_TEACHER_ID,
    createdByRole: 'teacher',
    assignedToId: 'user-admin-1',
    createdAt: '2025-04-24T09:30:00',
    updatedAt: '2025-04-25T14:00:00',
  },
  {
    id: 'ticket-3',
    title: 'تغییر سطح زبان‌آموز',
    description: 'پس از آزمون، زبان‌آموز برای سطح B2 آماده است.',
    status: 'resolved',
    priority: 'low',
    createdById: DEMO_TEACHER_ID,
    createdByRole: 'teacher',
    studentId: 'user-student-3',
    createdAt: '2025-04-20T11:00:00',
    updatedAt: '2025-04-22T16:30:00',
  },
];

export const seedTicketComments: TicketComment[] = [
  {
    id: 'tcomment-1',
    ticketId: 'ticket-2',
    authorId: 'user-admin-1',
    authorRole: 'admin',
    body: 'رمز عبور بازنشانی شد. لطفاً مجدداً تست کنید.',
    createdAt: '2025-04-25T14:00:00',
  },
];

export function createTicketId() {
  return `ticket-${crypto.randomUUID()}`;
}

export function createCommentId() {
  return `tcomment-${crypto.randomUUID()}`;
}

export const TICKET_STATUSES: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: 'باز' },
  { value: 'in_progress', label: 'در حال بررسی' },
  { value: 'resolved', label: 'حل شده' },
  { value: 'closed', label: 'بسته' },
];

export const TICKET_PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'کم' },
  { value: 'medium', label: 'متوسط' },
  { value: 'high', label: 'بالا' },
];
