import type { UserRole } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'زبان‌آموز',
  parent: 'ولی',
  teacher: 'مدرس',
  admin: 'ادمین',
};

export interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'داشبورد', href: '/dashboard', roles: ['student', 'parent', 'teacher', 'admin'] },
  { label: 'جلسات', href: '/dashboard/sessions', roles: ['student', 'parent', 'teacher'] },
  { label: 'آزمون‌ها', href: '/dashboard/exams', roles: ['student', 'teacher'] },
  { label: 'حضور و غیاب', href: '/dashboard/attendance', roles: ['student', 'parent'] },
  { label: 'پیام‌ها', href: '/dashboard/messages', roles: ['parent', 'teacher'] },
  { label: 'تیکت‌ها', href: '/dashboard/tickets', roles: ['teacher', 'admin'] },
  { label: 'زبان‌آموزان', href: '/dashboard/students', roles: ['teacher'] },
  { label: 'کاربران', href: '/dashboard/admin/users', roles: ['admin'] },
  { label: 'تحلیل‌ها', href: '/dashboard/admin/analytics', roles: ['admin'] },
  { label: 'درآمد', href: '/dashboard/admin/revenue', roles: ['admin'] },
];

export function getNavItemsForRole(role: UserRole) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function isRouteAllowedForRole(path: string, role: UserRole) {
  if (path === '/dashboard') return true;

  if (path.startsWith('/dashboard/admin/')) {
    return role === 'admin';
  }

  if (path.startsWith('/dashboard/tickets')) {
    return role === 'admin' || role === 'teacher';
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
