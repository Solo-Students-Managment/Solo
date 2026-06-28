import { useAuth } from '@/app/providers/AuthContext';
import { AdminHomePage } from '@/features/admin/AdminHomePage';
import { ParentHomePage } from '@/features/parent/page';
import { StudentHomePage } from '@/features/student/page';
import { TeacherHomePage } from '@/features/teacher/TeacherHomePage';

export function DashboardHomePage() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'student':
      return <StudentHomePage />;
    case 'parent':
      return <ParentHomePage />;
    case 'teacher':
      return <TeacherHomePage />;
    case 'admin':
      return <AdminHomePage />;
    default: {
      const _exhaustive: never = user.role;
      void _exhaustive;
      return null;
    }
  }
}
