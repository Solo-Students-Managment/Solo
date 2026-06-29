import { AlertTriangle, CalendarDays, Clock3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/app/providers/AuthContext';
import { getStudentName, getTeacherName, useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/features/shared/components/StatCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber, formatPersianDate, formatPersianDateTime } from '@/lib/formatters';

export function SchedulePage() {
  const { user } = useAuth();
  const { currentStudent, parentChildren, teacherStudents, sessions } = useMockData();

  const isTeacher = user?.role === 'teacher';
  const isParent = user?.role === 'parent';
  const isStudent = user?.role === 'student';

  const nextSession = sessions[0];
  const studentName = currentStudent ? getStudentName(currentStudent.userId) : 'نامشخص';
  const teacherName =
    isStudent || isParent ? getTeacherName(nextSession?.teacherId ?? '') : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">برنامه و جلسات</h2>
        <p className="text-muted-foreground text-sm">
          {isTeacher
            ? 'مدیریت تقویم جلسات و وظایف آموزشی'
            : isParent
              ? 'نمایش برنامه فرزند و جلسات آینده'
              : 'نمایش جلسات و برنامه هفته'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="جلسات پیش رو"
          value={formatNumber(sessions.length)}
          icon={<CalendarDays className="text-primary h-4 w-4" />}
        />
        <StatCard
          title="دانش‌آموزان"
          value={formatNumber(isTeacher ? teacherStudents.length : parentChildren.length)}
          icon={<Users className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          title="جلسه بعدی"
          value={nextSession ? formatPersianDateTime(nextSession.date) : 'ثبت نشده'}
          icon={<Clock3 className="h-4 w-4 text-slate-700" />}
        />
        <StatCard
          title="وضعیت"
          value={
            nextSession
              ? nextSession.attendanceStatus === 'absent'
                ? 'مراقب باشید'
                : 'زمان‌بندی خوب'
              : 'بدون جلسه'
          }
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">جلسات آینده</CardTitle>
            <Link to="/dashboard/sessions" className="text-sm text-slate-500 hover:text-slate-700">
              مشاهده همه جلسات
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>موضوع</TableHead>
                  <TableHead>دانش‌آموز</TableHead>
                  <TableHead>ساعت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.slice(0, 6).map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{formatPersianDate(session.date)}</TableCell>
                    <TableCell>{session.topic}</TableCell>
                    <TableCell>
                      {isTeacher
                        ? getStudentName(session.studentId)
                        : isParent
                          ? studentName
                          : (teacherName ?? '—')}
                    </TableCell>
                    <TableCell>
                      {formatPersianDateTime(session.date).split('،')[1] ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">راهنمای استفاده</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>جلسات آینده خود را بررسی کنید و در صورت نیاز به استاد یا والدین اطلاع دهید.</p>
            <p>اطلاعات کلاس، لینک جلسه و وضعیت حضور در این بخش نمایش داده می‌شود.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
