import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getStudentByUserId } from '@/mocks/students';
import { getSessionsByStudentId } from '@/mocks/sessions';
import { useStudentName } from '@/hooks/useMockData';
import { ProgressChart } from '@/components/shared/ProgressChart';
import { SessionsTable } from '@/components/shared/SessionsTable';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber, formatPercent, formatScore } from '@/lib/formatters';
import { getAttendanceRate } from '@/mocks/students';

export function StudentDetailPage() {
  const { id } = useParams();
  const student = id ? getStudentByUserId(id) : undefined;
  const name = useStudentName(id ?? '');
  const sessions = id ? getSessionsByStudentId(id) : [];

  if (!student || !id) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">زبان‌آموز یافت نشد.</p>
        <Button asChild variant="outline">
          <Link to="/dashboard/students">بازگشت</Link>
        </Button>
      </div>
    );
  }

  const rate = getAttendanceRate(student.attendanceStats);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="ps-0">
        <Link to="/dashboard/students">
          <ArrowRight className="h-4 w-4" />
          بازگشت به زبان‌آموزان
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-sm">سطح</p>
            <p className="font-semibold">{student.level}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">میانگین نمرات</p>
            <p className="font-semibold">{formatScore(student.averageScore)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">نرخ حضور</p>
            <p className="font-semibold">{formatPercent(rate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">جلسات</p>
            <p className="font-semibold">{formatNumber(student.sessionsCompleted)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="حاضر" value={formatNumber(student.attendanceStats.present)} />
        <StatCard title="غایب" value={formatNumber(student.attendanceStats.absent)} />
        <StatCard title="تأخیر" value={formatNumber(student.attendanceStats.late)} />
      </div>

      <ProgressChart sessions={sessions} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">تاریخچه جلسات</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionsTable sessions={sessions} />
        </CardContent>
      </Card>
    </div>
  );
}
