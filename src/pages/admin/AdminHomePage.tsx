import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStudents } from '@/contexts/StudentContext'
import { computeAdminStats } from '@/lib/adminAnalytics'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatNumber, formatPercent, formatScore, toPersianDigits } from '@/lib/formatters'

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
]

import { Button } from '@/components/ui/button'

export function AdminHomePage() {
  const { version } = useStudents()
  const adminStats = useMemo(() => {
    void version
    return computeAdminStats()
  }, [version])

  const homeworkPie = [
    { name: 'انجام شده', value: adminStats.homeworkCompletionRate },
    { name: 'انجام نشده', value: 100 - adminStats.homeworkCompletionRate },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">داشبورد مدیریتی</h2>
        <p className="text-sm text-muted-foreground">آمار کلی آموزشگاه</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild><Link to="/dashboard/admin/users">مدیریت کاربران</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to="/dashboard/admin/analytics">تحلیل‌ها</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to="/dashboard/admin/revenue">درآمد</Link></Button>
        <Button variant="outline" size="sm" asChild><Link to="/dashboard/tickets">تیکت‌ها</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="میانگین نمرات" value={formatScore(adminStats.averageScore)} />
        <StatCard title="مدرسان" value={formatNumber(adminStats.totalTeachers)} />
        <StatCard title="اولیا" value={formatNumber(adminStats.totalParents)} />
        <StatCard title="زبان‌آموزان" value={formatNumber(adminStats.totalStudents)} />
        <StatCard title="نرخ حضور" value={formatPercent(adminStats.attendanceRate)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="انجام تکالیف" value={formatPercent(adminStats.homeworkCompletionRate)} />
        <StatCard title="مشاهده گزارش اولیا" value={formatPercent(adminStats.parentReportViewRate)} />
        <StatCard title="زبان‌آموزان فعال" value={formatNumber(adminStats.activeStudents)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">پیشرفت ماهانه</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adminStats.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 20]} tickFormatter={(v) => toPersianDigits(v)} />
                  <Tooltip formatter={(value) => [formatScore(Number(value)), 'میانگین']} />
                  <Bar dataKey="avgScore" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
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
                <PieChart>
                  <Pie
                    data={homeworkPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${toPersianDigits(value)}٪`}
                  >
                    {homeworkPie.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${toPersianDigits(Number(value))}٪`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">روند حضور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={adminStats.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${toPersianDigits(v)}٪`} />
                  <Tooltip formatter={(value) => [`${toPersianDigits(Number(value))}٪`, 'حضور']} />
                  <Line type="monotone" dataKey="rate" stroke="var(--color-chart-2)" strokeWidth={2} />
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
                  <TableHead>میانگین نمره</TableHead>
                  <TableHead>حضور</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminStats.studentRankings.map((student, index) => (
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
  )
}
