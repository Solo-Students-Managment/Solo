import type { UserRole } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'زبان‌آموز',
  parent: 'ولی',
  teacher: 'مدرس',
  admin: 'ادمین',
  support: 'پشتیبان',
};

export interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'داشبورد',
    href: '/dashboard',
    roles: ['student', 'parent', 'teacher', 'admin', 'support'],
  },
  {
    label: 'ورود OTP',
    href: '/dashboard/otp-access',
    roles: ['student', 'parent', 'teacher', 'admin', 'support'],
  },
  {
    label: 'اعلان‌ها',
    href: '/dashboard/notifications',
    roles: ['student', 'parent', 'teacher', 'admin', 'support'],
  },
  { label: 'جلسات', href: '/dashboard/sessions', roles: ['student', 'parent', 'teacher'] },
  { label: 'آزمون‌ها', href: '/dashboard/exams', roles: ['student', 'teacher'] },
  { label: 'حضور و غیاب', href: '/dashboard/attendance', roles: ['student', 'parent'] },
  { label: 'برنامه', href: '/dashboard/schedule', roles: ['student', 'parent', 'teacher'] },
  { label: 'تقویم جامع', href: '/dashboard/calendar', roles: ['student', 'parent', 'teacher'] },
  {
    label: 'درس‌ها',
    href: '/dashboard/subjects',
    roles: ['student', 'parent', 'teacher', 'admin'],
  },
  { label: 'تکالیف', href: '/dashboard/homework', roles: ['student', 'parent', 'teacher'] },
  {
    label: 'پرداخت‌ها',
    href: '/dashboard/payments',
    roles: ['student', 'parent', 'teacher', 'admin'],
  },
  { label: 'گواهی‌ها', href: '/dashboard/certificates', roles: ['student', 'parent', 'teacher'] },
  { label: 'پیام‌ها', href: '/dashboard/messages', roles: ['parent', 'teacher'] },
  { label: 'تیکت‌ها', href: '/dashboard/tickets', roles: ['teacher', 'admin', 'support'] },
  { label: 'شروع مدرس', href: '/dashboard/onboarding', roles: ['teacher', 'admin'] },
  { label: 'زمان آزاد', href: '/dashboard/availability', roles: ['teacher'] },
  { label: 'طرح درس', href: '/dashboard/lesson-plans', roles: ['teacher'] },
  { label: 'فایل‌ها', href: '/dashboard/files', roles: ['teacher', 'student', 'parent'] },
  { label: 'بانک سؤال', href: '/dashboard/question-bank', roles: ['teacher', 'admin'] },
  { label: 'تصحیح دستی', href: '/dashboard/grading', roles: ['teacher'] },
  { label: 'ترم‌ها', href: '/dashboard/semesters', roles: ['teacher', 'admin'] },
  { label: 'پروفایل مدرس', href: '/dashboard/profile', roles: ['teacher'] },
  { label: 'پروفایل عمومی', href: '/dashboard/public-profile', roles: ['teacher'] },
  { label: 'مقاله‌ها', href: '/dashboard/articles', roles: ['teacher'] },
  { label: 'اشتراک', href: '/dashboard/subscription', roles: ['teacher', 'admin'] },
  { label: 'زبان‌آموزان', href: '/dashboard/students', roles: ['teacher'] },
  { label: 'کاربران', href: '/dashboard/admin/users', roles: ['admin'] },
  { label: 'تحلیل‌ها', href: '/dashboard/admin/analytics', roles: ['admin'] },
  { label: 'درآمد', href: '/dashboard/admin/revenue', roles: ['admin'] },
  { label: 'قالب SMS', href: '/dashboard/admin/sms', roles: ['admin'] },
  { label: 'دسترسی‌ها', href: '/dashboard/admin/permissions', roles: ['admin'] },
  { label: 'تأیید پروفایل', href: '/dashboard/admin/profile-approvals', roles: ['admin'] },
  { label: 'همه گفتگوها', href: '/dashboard/admin/all-chats', roles: ['admin', 'support'] },
  { label: 'مسدودی/Login As', href: '/dashboard/admin/bans', roles: ['admin'] },
];

export function getNavItemsForRole(role: UserRole) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function isRouteAllowedForRole(path: string, role: UserRole) {
  if (path === '/dashboard') return true;

  if (path.startsWith('/dashboard/admin/')) {
    if (path === '/dashboard/admin/all-chats') return role === 'admin' || role === 'support';
    return role === 'admin';
  }

  if (path.startsWith('/dashboard/tickets')) {
    return role === 'admin' || role === 'teacher' || role === 'support';
  }

  if (path.startsWith('/dashboard/sessions/')) {
    if (path === '/dashboard/sessions/new') return role === 'teacher';
    return ['student', 'parent', 'teacher'].includes(role);
  }

  if (path.startsWith('/dashboard/students')) {
    if (path === '/dashboard/students/new') return role === 'teacher';
    if (path.match(/^\/dashboard\/students\/[^/]+$/)) return role === 'teacher';
    if (path === '/dashboard/students') return role === 'teacher';
    return false;
  }

  if (path.startsWith('/dashboard/exams')) {
    if (path === '/dashboard/exams/new') return role === 'teacher';
    if (path.startsWith('/dashboard/exams/take/')) return role === 'student';
    if (path.match(/^\/dashboard\/exams\/[^/]+$/)) return role === 'teacher';
    if (path === '/dashboard/exams') return role === 'student' || role === 'teacher';
    return false;
  }

  const item = NAV_ITEMS.find((nav) => path === nav.href || path.startsWith(`${nav.href}/`));
  if (!item) return false;
  return item.roles.includes(role);
}
