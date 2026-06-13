import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Session } from '@/types'
import { useSessionScore } from '@/contexts/SessionScoreContext'
import { formatPersianDate, formatScore, toPersianDigits } from '@/lib/formatters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProgressChartProps {
  sessions: Session[]
  title?: string
}

export function ProgressChart({ sessions, title = 'نمودار پیشرفت' }: ProgressChartProps) {
  const { getScore } = useSessionScore()

  const data = [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-8)
    .map((session) => ({
      name: formatPersianDate(session.date).split(' ')[1] ?? formatPersianDate(session.date),
      score: getScore(session.id, session.finalScore),
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 20]} tickFormatter={(v) => toPersianDigits(v)} />
              <Tooltip
                formatter={(value) => [formatScore(Number(value)), 'نمره']}
                labelFormatter={(label) => `ماه: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
