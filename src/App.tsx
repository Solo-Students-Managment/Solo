import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { ExamProvider } from '@/contexts/ExamContext'
import { HomeworkProvider } from '@/contexts/HomeworkContext'
import { SessionApprovalProvider } from '@/contexts/SessionApprovalContext'
import { SessionScoreProvider } from '@/contexts/SessionScoreContext'
import { StudentProvider } from '@/contexts/StudentContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/sonner'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AttendancePage } from '@/pages/AttendancePage'
import { DashboardHomePage } from '@/pages/DashboardHomePage'
import { LoginPage } from '@/pages/LoginPage'
import { SessionDetailPage } from '@/pages/SessionDetailPage'
import { SessionsListPage } from '@/pages/SessionsListPage'
import { ExamCreatePage } from '@/pages/exams/ExamCreatePage'
import { ExamDetailPage } from '@/pages/exams/ExamDetailPage'
import { ExamsPage } from '@/pages/exams/ExamsPage'
import { TakeExamPage } from '@/pages/exams/TakeExamPage'
import { MessagesPage } from '@/pages/messages/MessagesPage'
import { SessionFormPage } from '@/pages/teacher/SessionFormPage'
import { StudentCreatePage } from '@/pages/teacher/StudentCreatePage'
import { StudentDetailPage } from '@/pages/teacher/StudentDetailPage'
import { TicketProvider } from '@/contexts/TicketContext'
import { RevenueProvider } from '@/contexts/RevenueContext'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage'
import { AdminRevenuePage } from '@/pages/admin/AdminRevenuePage'
import { TicketsPage } from '@/pages/tickets/TicketsPage'
import { StudentsListPage } from '@/pages/teacher/StudentsListPage'

export default function App() {
  return (
    <AuthProvider>
      <StudentProvider>
      <HomeworkProvider>
        <SessionScoreProvider>
          <SessionApprovalProvider>
          <ChatProvider>
          <TicketProvider>
          <RevenueProvider>
          <ExamProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHomePage />} />
              <Route path="/dashboard/sessions" element={<SessionsListPage />} />
              <Route path="/dashboard/sessions/:id" element={<SessionDetailPage />} />
              <Route path="/dashboard/attendance" element={<AttendancePage />} />
              <Route path="/dashboard/exams" element={<ExamsPage />} />
              <Route path="/dashboard/exams/new" element={<ExamCreatePage />} />
              <Route path="/dashboard/exams/take/:assignmentId" element={<TakeExamPage />} />
              <Route path="/dashboard/exams/:id" element={<ExamDetailPage />} />
              <Route path="/dashboard/messages" element={<MessagesPage />} />
              <Route path="/dashboard/tickets" element={<TicketsPage />} />
              <Route path="/dashboard/admin/users" element={<AdminUsersPage />} />
              <Route path="/dashboard/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/dashboard/admin/revenue" element={<AdminRevenuePage />} />
              <Route path="/dashboard/students" element={<StudentsListPage />} />
              <Route path="/dashboard/students/new" element={<StudentCreatePage />} />
              <Route path="/dashboard/students/:id" element={<StudentDetailPage />} />
              <Route path="/dashboard/sessions/new" element={<SessionFormPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
          </ExamProvider>
          </RevenueProvider>
          </TicketProvider>
          </ChatProvider>
          </SessionApprovalProvider>
        </SessionScoreProvider>
      </HomeworkProvider>
      </StudentProvider>
    </AuthProvider>
  )
}
