import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMemo } from 'react';
import { useStudents } from '@/app/providers/StudentContext';
import { computeAdminStats } from '@/lib/adminAnalytics';
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
import { formatNumber, formatPercent, formatScore, toPersianDigits } from '@/lib/formatters';

export function AdminAnalyticsPage() {
  const { version } = useStudents();
  const stats = useMemo(() => {
    void version;
    return computeAdminStats();
  }, [version]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">تحلیل‌ها</h2>
        <p className="text-muted-foreground text-sm">گزارش عملکرد آموزشگاه</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="زبان‌آموزان" value={formatNumber(stats.totalStudents)} />
        <StatCard title="مدرسان" value={formatNumber(stats.totalTeachers)} />
        <StatCard title="اولیا" value={formatNumber(stats.totalParents)} />
        <StatCard title="میانگین نمرات" value={formatScore(stats.averageScore)} />
        <StatCard title="نرخ حضور" value={formatPercent(stats.attendanceRate)} />
        <StatCard title="تکالیف" value={formatPercent(stats.homeworkCompletionRate)} />
        <StatCard title="مشاهده گزارش" value={formatPercent(stats.parentReportViewRate)} />
        <StatCard title="زبان‌آموزان فعال" value={formatNumber(stats.activeStudents)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">پیشرفت نمرات ماهانه</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 20]} tickFormatter={(v) => toPersianDigits(v)} />
                  <Tooltip formatter={(v) => [formatScore(Number(v)), 'میانگین']} />
                  <Bar dataKey="avgScore" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">روند ثبت‌نام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => toPersianDigits(v)} />
                  <Tooltip formatter={(v) => [formatNumber(Number(v)), 'تعداد']} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-chart-3)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">نرخ انجام تکالیف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.homeworkByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${toPersianDigits(v)}٪`} />
                  <Tooltip formatter={(v) => [`${toPersianDigits(Number(v))}٪`, '']} />
                  <Bar dataKey="rate" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">روند حضور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${toPersianDigits(v)}٪`} />
                  <Tooltip formatter={(v) => [`${toPersianDigits(Number(v))}٪`, 'حضور']} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="var(--color-chart-4)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">رتبه‌بندی زبان‌آموزان</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رتبه</TableHead>
                  <TableHead>نام</TableHead>
                  <TableHead>سطح</TableHead>
                  <TableHead>میانگین</TableHead>
                  <TableHead>حضور</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.studentRankings.map((student, index) => (
                  <TableRow key={student.studentId}>
                    <TableCell>{toPersianDigits(index + 1)}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.level}</TableCell>
                    <TableCell>{formatScore(student.avgScore)}</TableCell>
                    <TableCell>{formatPercent(student.attendanceRate)}</TableCell>
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
