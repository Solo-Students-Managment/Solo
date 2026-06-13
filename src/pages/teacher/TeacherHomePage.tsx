import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarDays, TrendingUp, Users } from 'lucide-react'
import { useMockData, useStudentName } from '@/hooks/useMockData'
import { getAttendanceRate } from '@/mocks/students'
import { SessionsTable } from '@/components/shared/SessionsTable'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatNumber, formatPercent, formatScore } from '@/lib/formatters'

export function TeacherHomePage() {
  const { teacherStudents, sessions } = useMockData()

  const sessionsThisMonth = sessions.filter((session) => {
    const date = new Date(session.date)
    const now = new Date('2025-04-26')
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })

  const avgClassScore =
    teacherStudents.reduce((sum, student) => sum + student.averageScore, 0) /
    (teacherStudents.length || 1)

  const needsAttention = teacherStudents.filter((student) => {
    const rate = getAttendanceRate(student.attendanceStats)
    return student.averageScore < 14 || rate < 80
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">داشبورد مدرس</h2>
          <p className="text-sm text-muted-foreground">مدیریت کلاس و پیگیری زبان‌آموزان</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/sessions?tab=new">ثبت جلسه جدید</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="تعداد زبان‌آموزان"
          value={formatNumber(teacherStudents.length)}
          icon={<Users className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="جلسات این ماه"
          value={formatNumber(sessionsThisMonth.length)}
          icon={<CalendarDays className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="میانگین نمرات کلاس"
          value={formatScore(Math.round(avgClassScore * 10) / 10)}
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="نیاز به توجه"
          value={formatNumber(needsAttention.length)}
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">زبان‌آموزان نیازمند توجه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>سطح</TableHead>
                  <TableHead>میانگین</TableHead>
                  <TableHead>حضور</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needsAttention.map((student) => (
                  <AttentionRow key={student.userId} userId={student.userId} student={student} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">جلسات اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionsTable sessions={sessions.slice(0, 6)} showStudent />
        </CardContent>
      </Card>
    </div>
  )
}

function AttentionRow({
  userId,
  student,
}: {
  userId: string
  student: {
    level: string
    averageScore: number
    attendanceStats: { present: number; absent: number; late: number }
  }
}) {
  const name = useStudentName(userId)
  const rate = getAttendanceRate(student.attendanceStats)

  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell>{student.level}</TableCell>
      <TableCell>{formatScore(student.averageScore)}</TableCell>
      <TableCell>{formatPercent(rate)}</TableCell>
    </TableRow>
  )
}
