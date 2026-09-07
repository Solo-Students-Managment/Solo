import { Navigate, type RouteObject } from 'react-router-dom';

import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { PublicRoute } from '@/app/router/PublicRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminAnalyticsPage } from '@/features/admin/AdminAnalyticsPage';
import { AdminRevenuePage } from '@/features/admin/AdminRevenuePage';
import { AdminUsersPage } from '@/features/admin/AdminUsersPage';
import { AttendancePage } from '@/features/attendance/page';
import { HomeworkPage } from '@/features/homework/page';
import { LoginPage } from '@/features/auth/page';
import { DashboardHomePage } from '@/features/dashboard/page';
import { ExamCreatePage } from '@/features/exams/ExamCreatePage';
import { ExamDetailPage } from '@/features/exams/ExamDetailPage';
import { ExamsPage } from '@/features/exams/ExamsPage';
import { SchedulePage } from '@/features/schedule/page';
import { SubscriptionPage } from '@/features/subscription/page';
import { TakeExamPage } from '@/features/exams/TakeExamPage';
import { MessagesPage } from '@/features/messages/page';
import { SessionDetailPage } from '@/features/sessions/SessionDetailPage';
import { SessionsListPage } from '@/features/sessions/SessionsListPage';
import { SessionFormPage } from '@/features/teacher/SessionFormPage';
import { StudentCreatePage } from '@/features/teacher/StudentCreatePage';
import { StudentDetailPage } from '@/features/teacher/StudentDetailPage';
import { StudentsListPage } from '@/features/teacher/StudentsListPage';
import { TeacherProfilePage } from '@/features/teacher/TeacherProfilePage';
import { TicketsPage } from '@/features/tickets/page';
import { NotFoundPage } from '@/features/misc/NotFoundPage';
import {
  AdminPermissionsPage,
  AllChatsPage,
  ArticlesPage,
  AvailabilityPage,
  CalendarPage,
  CertificatesPage,
  FilesPage,
  LessonPlansPage,
  ManualGradingPage,
  NotificationsPage,
  OtpAccessPage,
  PaymentCenterPage,
  ProfileApprovalsPage,
  QuestionBankPage,
  SemestersPage,
  SmsTemplatesPage,
  SubjectsPage,
  TeacherOnboardingPage,
  TeacherPublicProfilePage,
  UserBansPage,
} from '@/features/prd/MockFeaturePage';

export const routes: RouteObject[] = [
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
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
          { path: '/dashboard/otp-access', element: <OtpAccessPage /> },
          { path: '/dashboard/onboarding', element: <TeacherOnboardingPage /> },
          { path: '/dashboard/attendance', element: <AttendancePage /> },
          { path: '/dashboard/schedule', element: <SchedulePage /> },
          { path: '/dashboard/calendar', element: <CalendarPage /> },
          { path: '/dashboard/subjects', element: <SubjectsPage /> },
          { path: '/dashboard/homework', element: <HomeworkPage /> },
          { path: '/dashboard/payments', element: <PaymentCenterPage /> },
          { path: '/dashboard/certificates', element: <CertificatesPage /> },
          { path: '/dashboard/subscription', element: <SubscriptionPage /> },
          { path: '/dashboard/availability', element: <AvailabilityPage /> },
          { path: '/dashboard/lesson-plans', element: <LessonPlansPage /> },
          { path: '/dashboard/files', element: <FilesPage /> },
          { path: '/dashboard/notifications', element: <NotificationsPage /> },
          { path: '/dashboard/question-bank', element: <QuestionBankPage /> },
          { path: '/dashboard/grading', element: <ManualGradingPage /> },
          { path: '/dashboard/semesters', element: <SemestersPage /> },
          { path: '/dashboard/profile', element: <TeacherProfilePage /> },
          { path: '/dashboard/public-profile', element: <TeacherPublicProfilePage /> },
          { path: '/dashboard/articles', element: <ArticlesPage /> },
          { path: '/dashboard/exams', element: <ExamsPage /> },
          { path: '/dashboard/exams/new', element: <ExamCreatePage /> },
          { path: '/dashboard/exams/take/:assignmentId', element: <TakeExamPage /> },
          { path: '/dashboard/exams/:id', element: <ExamDetailPage /> },
          { path: '/dashboard/messages', element: <MessagesPage /> },
          { path: '/dashboard/tickets', element: <TicketsPage /> },
          { path: '/dashboard/admin/users', element: <AdminUsersPage /> },
          { path: '/dashboard/admin/analytics', element: <AdminAnalyticsPage /> },
          { path: '/dashboard/admin/revenue', element: <AdminRevenuePage /> },
          { path: '/dashboard/admin/sms', element: <SmsTemplatesPage /> },
          { path: '/dashboard/admin/permissions', element: <AdminPermissionsPage /> },
          { path: '/dashboard/admin/profile-approvals', element: <ProfileApprovalsPage /> },
          { path: '/dashboard/admin/all-chats', element: <AllChatsPage /> },
          { path: '/dashboard/admin/bans', element: <UserBansPage /> },
          { path: '/dashboard/students', element: <StudentsListPage /> },
          { path: '/dashboard/students/new', element: <StudentCreatePage /> },
          { path: '/dashboard/students/:id', element: <StudentDetailPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
