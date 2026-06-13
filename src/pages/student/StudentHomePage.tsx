import { Award, BookOpen, CalendarCheck, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getAttendanceRate } from '@/hooks/useMockData'
import { useMockData } from '@/hooks/useMockData'
import { ProgressChart } from '@/components/shared/ProgressChart'
import { SessionsTable } from '@/components/shared/SessionsTable'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatPercent, formatScore } from '@/lib/formatters'

export function StudentHomePage() {
  const { user } = useAuth()
  const { currentStudent, sessions } = useMockData()

  if (!user || !currentStudent) {
    return <p className="text-muted-foreground">اطلاعات زبان‌آموز یافت نشد.</p>
  }

  const attendanceRate = getAttendanceRate(currentStudent.attendanceStats)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>سلام، {user.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">سطح آموزشی</p>
            <p className="text-lg font-semibold">{currentStudent.level}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">جلسات گذرانده</p>
            <p className="text-lg font-semibold">{formatNumber(currentStudent.sessionsCompleted)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">جلسات باقی‌مانده</p>
            <p className="text-lg font-semibold">{formatNumber(currentStudent.sessionsRemaining)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">میانگین نمرات</p>
            <p className="text-lg font-semibold">{formatScore(currentStudent.averageScore)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="حضور"
          value={formatNumber(currentStudent.attendanceStats.present)}
          description={`${formatPercent(attendanceRate)} نرخ حضور`}
          icon={<CalendarCheck className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          title="غیبت"
          value={formatNumber(currentStudent.attendanceStats.absent)}
          icon={<BookOpen className="h-4 w-4 text-red-600" />}
        />
        <StatCard
          title="تأخیر"
          value={formatNumber(currentStudent.attendanceStats.late)}
          icon={<TrendingUp className="h-4 w-4 text-amber-600" />}
        />
        <StatCard
          title="میانگین نمرات"
          value={formatScore(currentStudent.averageScore)}
          icon={<Award className="h-4 w-4 text-primary" />}
        />
      </div>

      <ProgressChart sessions={sessions} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">جلسات اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionsTable sessions={sessions.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  )
}
