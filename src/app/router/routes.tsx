import { Navigate, type RouteObject } from 'react-router-dom';

import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminAnalyticsPage } from '@/features/admin/AdminAnalyticsPage';
import { AdminRevenuePage } from '@/features/admin/AdminRevenuePage';
import { AdminUsersPage } from '@/features/admin/AdminUsersPage';
import { AttendancePage } from '@/features/attendance/page';
import { LoginPage } from '@/features/auth/page';
import { DashboardHomePage } from '@/features/dashboard/page';
import { ExamCreatePage } from '@/features/exams/ExamCreatePage';
import { ExamDetailPage } from '@/features/exams/ExamDetailPage';
import { ExamsPage } from '@/features/exams/ExamsPage';
import { TakeExamPage } from '@/features/exams/TakeExamPage';
import { MessagesPage } from '@/features/messages/page';
import { SessionDetailPage } from '@/features/sessions/SessionDetailPage';
import { SessionsListPage } from '@/features/sessions/SessionsListPage';
import { SessionFormPage } from '@/features/teacher/SessionFormPage';
import { StudentCreatePage } from '@/features/teacher/StudentCreatePage';
import { StudentDetailPage } from '@/features/teacher/StudentDetailPage';
import { StudentsListPage } from '@/features/teacher/StudentsListPage';
import { TicketsPage } from '@/features/tickets/page';

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <DashboardHomePage /> },
          { path: '/dashboard/sessions', element: <SessionsListPage /> },
          { path: '/dashboard/sessions/:id', element: <SessionDetailPage /> },
          { path: '/dashboard/sessions/new', element: <SessionFormPage /> },
          { path: '/dashboard/attendance', element: <AttendancePage /> },
          { path: '/dashboard/exams', element: <ExamsPage /> },
          { path: '/dashboard/exams/new', element: <ExamCreatePage /> },
          { path: '/dashboard/exams/take/:assignmentId', element: <TakeExamPage /> },
          { path: '/dashboard/exams/:id', element: <ExamDetailPage /> },
          { path: '/dashboard/messages', element: <MessagesPage /> },
          { path: '/dashboard/tickets', element: <TicketsPage /> },
          { path: '/dashboard/admin/users', element: <AdminUsersPage /> },
          { path: '/dashboard/admin/analytics', element: <AdminAnalyticsPage /> },
          { path: '/dashboard/admin/revenue', element: <AdminRevenuePage /> },
          { path: '/dashboard/students', element: <StudentsListPage /> },
          { path: '/dashboard/students/new', element: <StudentCreatePage /> },
          { path: '/dashboard/students/:id', element: <StudentDetailPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];
