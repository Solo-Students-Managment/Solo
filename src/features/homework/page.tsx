import { BookOpen, CheckCircle2, ClipboardList, FileText } from 'lucide-react';

import { useAuth } from '@/app/providers/AuthContext';
import { getStudentName, useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/features/shared/components/StatCard';
import { formatNumber, formatPercent, formatPersianDate } from '@/lib/formatters';

export function HomeworkPage() {
  const { user } = useAuth();
  const { currentStudent, sessions } = useMockData();

  const homeworkSessions = sessions.filter((session) => session.homework.tasks.length > 0);
  const latestSession = homeworkSessions[0];
  const totalTasks = homeworkSessions.reduce(
    (sum, session) => sum + session.homework.tasks.length,
    0
  );
  const completedTasks = homeworkSessions.reduce(
    (sum, session) => sum + session.homework.tasks.filter((task) => task.title).length,
    0
  );

  if (!currentStudent && user?.role !== 'teacher') {
    return <p className="text-muted-foreground">اطلاعات تکالیف یافت نشد.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">تکالیف</h2>
        <p className="text-muted-foreground text-sm">
          {user?.role === 'teacher'
            ? 'بررسی و مدیریت تکالیف دانش‌آموزان'
            : 'پیشرفت تکالیف و گزارشات آموزشی'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="جلسات دارای تکلیف"
          value={formatNumber(homeworkSessions.length)}
          icon={<ClipboardList className="h-4 w-4 text-slate-700" />}
        />
        <StatCard
          title="کل وظایف"
          value={formatNumber(totalTasks)}
          icon={<FileText className="text-primary h-4 w-4" />}
        />
        <StatCard
          title="وظایف کامل شده"
          value={formatNumber(completedTasks)}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          title="درصد تکمیل"
          value={formatPercent(totalTasks ? (completedTasks / totalTasks) * 100 : 0)}
          icon={<BookOpen className="h-4 w-4 text-amber-600" />}
        />
      </div>

      {latestSession ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">آخرین تکلیف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">
                جلسه: {latestSession.topic} — تاریخ: {formatPersianDate(latestSession.date)}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {latestSession.homework.tasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border p-4">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-muted-foreground text-xs">وظیفه آموزشی</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center">
            هیچ تکلیفی هنوز اختصاص داده نشده است.
          </CardContent>
        </Card>
      )}

      {user?.role !== 'teacher' && currentStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">دانش‌آموز</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{getStudentName(currentStudent.userId)}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
