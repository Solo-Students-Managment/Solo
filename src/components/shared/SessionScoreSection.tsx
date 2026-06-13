import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionScore } from '@/contexts/SessionScoreContext'
import { clampSessionScore } from '@/lib/sessionScore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatScore } from '@/lib/formatters'

interface SessionScoreSectionProps {
  sessionId: string
  defaultScore: number
}

export function SessionScoreSection({ sessionId, defaultScore }: SessionScoreSectionProps) {
  const { user } = useAuth()
  const { getScore, setScore, hasOverride } = useSessionScore()
  const score = getScore(sessionId, defaultScore)
  const isTeacher = user?.role === 'teacher'

  const [draft, setDraft] = useState(String(score))

  useEffect(() => {
    setDraft(String(score))
  }, [score])

  const handleSave = () => {
    const parsed = clampSessionScore(Number(draft))
    setScore(sessionId, parsed)
    setDraft(String(parsed))
    toast.success('نمره جلسه ذخیره شد')
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-6">
        {isTeacher ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <Label htmlFor="session-score">نمره نهایی جلسه (۰ تا ۲۰)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="session-score"
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="w-28"
                />
                <span className="text-sm text-muted-foreground">از ۲۰</span>
              </div>
              {hasOverride(sessionId) && (
                <p className="text-xs text-muted-foreground">
                  نمره پیش‌فرض: {formatScore(defaultScore)}
                </p>
              )}
            </div>
            <Button type="button" onClick={handleSave}>
              ذخیره نمره
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">نمره نهایی جلسه</p>
              <p className="text-xs text-muted-foreground">ثبت‌شده توسط مدرس</p>
            </div>
            <p className="text-3xl font-bold">{formatScore(score)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
