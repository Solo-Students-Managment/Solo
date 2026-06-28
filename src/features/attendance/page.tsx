import { getAttendanceRate, useMockData } from '@/hooks/useMockData';
import { AttendanceBadge } from '@/features/shared/components/AttendanceBadge';
import { StatCard } from '@/features/shared/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber, formatPercent, formatPersianDate } from '@/lib/formatters';
import { useAuth } from '@/app/providers/AuthContext';

export function AttendancePage() {
  const { user } = useAuth();
  const { currentStudent, sessions } = useMockData();

  if (!currentStudent) {
    return <p className="text-muted-foreground">اطلاعات حضور و غیاب یافت نشد.</p>;
  }

  const stats = currentStudent.attendanceStats;
  const total = stats.present + stats.absent + stats.late;
  const rate = getAttendanceRate(stats);

  const monthlySummary = [
    { month: 'فروردین', present: 3, absent: 1, late: 0 },
    {
      month: 'اردیبهشت',
      present: stats.present - 3,
      absent: stats.absent - 1,
      late: stats.late,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">حضور و غیاب</h2>
        <p className="text-muted-foreground text-sm">
          {user?.role === 'parent' ? 'گزارش حضور فرزند' : 'وضعیت حضور شما'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="کل جلسات" value={formatNumber(total)} />
        <StatCard title="حاضر" value={formatNumber(stats.present)} />
        <StatCard title="غایب" value={formatNumber(stats.absent)} />
        <StatCard title="نرخ حضور" value={formatPercent(rate)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">گزارش ماهانه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ماه</TableHead>
                  <TableHead>حاضر</TableHead>
                  <TableHead>غایب</TableHead>
                  <TableHead>تأخیر</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlySummary.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{formatNumber(row.present)}</TableCell>
                    <TableCell>{formatNumber(row.absent)}</TableCell>
                    <TableCell>{formatNumber(row.late)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">جزئیات جلسات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>موضوع</TableHead>
                  <TableHead>وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{formatPersianDate(session.date)}</TableCell>
                    <TableCell>{session.topic}</TableCell>
                    <TableCell>
                      <AttendanceBadge status={session.attendanceStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
