import type { RevenueRecord, RevenueSummary } from '@/types';
import { DEMO_PARENT_ID, DEMO_STUDENT_ID } from '@/mocks/seedUsers';

export const seedRevenue: RevenueRecord[] = [
  {
    id: 'rev-1',
    studentId: DEMO_STUDENT_ID,
    parentId: DEMO_PARENT_ID,
    amount: 4_500_000,
    type: 'tuition',
    status: 'paid',
    date: '2025-04-01',
    description: 'شهریه اردیبهشت',
  },
  {
    id: 'rev-2',
    studentId: DEMO_STUDENT_ID,
    parentId: DEMO_PARENT_ID,
    amount: 850_000,
    type: 'exam',
    status: 'paid',
    date: '2025-04-10',
    description: 'آزمون تعیین سطح',
  },
  {
    id: 'rev-3',
    studentId: 'user-student-2',
    parentId: 'user-parent-2',
    amount: 4_500_000,
    type: 'tuition',
    status: 'pending',
    date: '2025-04-01',
    description: 'شهریه اردیبهشت',
  },
  {
    id: 'rev-4',
    studentId: 'user-student-3',
    parentId: 'user-parent-3',
    amount: 320_000,
    type: 'material',
    status: 'paid',
    date: '2025-03-20',
    description: 'کتاب آموزشی',
  },
  {
    id: 'rev-5',
    studentId: 'user-student-4',
    parentId: 'user-parent-4',
    amount: 4_500_000,
    type: 'tuition',
    status: 'overdue',
    date: '2025-03-01',
    description: 'شهریه فروردین',
  },
  {
    id: 'rev-6',
    studentId: 'user-student-5',
    parentId: 'user-parent-5',
    amount: 4_500_000,
    type: 'tuition',
    status: 'paid',
    date: '2025-04-01',
    description: 'شهریه اردیبهشت',
  },
];

export function createRevenueId() {
  return `rev-${crypto.randomUUID()}`;
}

export function computeRevenueSummary(records: RevenueRecord[]): RevenueSummary {
  const totalPaid = records.filter((r) => r.status === 'paid').reduce((s, r) => s + r.amount, 0);
  const totalPending = records
    .filter((r) => r.status === 'pending')
    .reduce((s, r) => s + r.amount, 0);
  const totalOverdue = records
    .filter((r) => r.status === 'overdue')
    .reduce((s, r) => s + r.amount, 0);

  const monthMap = new Map<string, { paid: number; pending: number }>();
  for (const record of records) {
    const month = new Intl.DateTimeFormat('fa-IR', { month: 'long' }).format(new Date(record.date));
    const current = monthMap.get(month) ?? { paid: 0, pending: 0 };
    if (record.status === 'paid') current.paid += record.amount;
    else current.pending += record.amount;
    monthMap.set(month, current);
  }

  const typeMap = new Map<RevenueRecord['type'], number>();
  for (const record of records) {
    typeMap.set(record.type, (typeMap.get(record.type) ?? 0) + record.amount);
  }

  return {
    totalPaid,
    totalPending,
    totalOverdue,
    monthlyRevenue: [...monthMap.entries()].map(([month, values]) => ({ month, ...values })),
    byType: [...typeMap.entries()].map(([type, amount]) => ({ type, amount })),
  };
}
