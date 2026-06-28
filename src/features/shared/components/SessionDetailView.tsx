import { CheckCircle2, Clock } from 'lucide-react';
import type { Session } from '@/types';
import { useSessionFinalScore } from '@/app/providers/SessionScoreContext';
import { formatPersianDate } from '@/lib/formatters';
import { useStudentName, useTeacherName } from '@/hooks/useMockData';
import { AttendanceBadge } from '@/features/shared/components/AttendanceBadge';
import { HomeworkSection } from '@/features/shared/components/HomeworkSection';
import { SessionScoreSection } from '@/features/shared/components/SessionScoreSection';
import { ScoreBadge } from '@/features/shared/components/ScoreBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SessionDetailViewProps {
  session: Session;
  readOnly?: boolean;
  showApprovalStatus?: boolean;
  parentConfirmed?: boolean;
}

export function SessionDetailView({
  session,
  readOnly = true,
  showApprovalStatus = false,
  parentConfirmed,
}: SessionDetailViewProps) {
  const teacherName = useTeacherName(session.teacherId);
  const studentName = useStudentName(session.studentId);
  const finalScore = useSessionFinalScore(session.id, session.finalScore);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>{session.topic}</CardTitle>
              <p className="text-muted-foreground mt-2 text-sm">
                {formatPersianDate(session.date)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AttendanceBadge status={session.attendanceStatus} />
              <ScoreBadge score={finalScore} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">مدرس</p>
            <p className="font-medium">{teacherName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">زبان‌آموز</p>
            <p className="font-medium">{studentName}</p>
          </div>
        </CardContent>
      </Card>

      <HomeworkSection
        sessionId={session.id}
        studentId={session.studentId}
        homework={session.homework}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">مشارکت کلاسی (۲۰٪)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant={session.participation.participated ? 'success' : 'danger'}>
            {session.participation.participated ? 'بله' : 'خیر'}
          </Badge>
          <ScoreBadge score={session.participation.score} />
          <p className="text-sm">{session.participation.teacherNote}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ارزیابی اسپیکینگ (۳۰٪)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {session.speaking.questions.length > 0 ? (
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              {session.speaking.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">سوالی ثبت نشده</p>
          )}
          <ScoreBadge score={session.speaking.score} />
          <p className="text-sm">{session.speaking.feedback}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ارزیابی کلی مدرس (۱۰٪)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">نقاط قوت</p>
            <div className="flex flex-wrap gap-2">
              {session.teacherEvaluation.strengths.map((item) => (
                <Badge key={item} variant="success">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">نقاط ضعف</p>
            <div className="flex flex-wrap gap-2">
              {session.teacherEvaluation.weaknesses.map((item) => (
                <Badge key={item} variant="danger">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-muted-foreground text-sm">پیشنهاد جلسه بعد</p>
            <p className="mt-1 text-sm">{session.teacherEvaluation.nextSessionRecommendation}</p>
          </div>
          <ScoreBadge score={session.teacherEvaluation.teacherNoteScore} />
        </CardContent>
      </Card>

      <SessionScoreSection sessionId={session.id} defaultScore={session.finalScore} />

      {showApprovalStatus && parentConfirmed !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">وضعیت تأیید ولی</CardTitle>
          </CardHeader>
          <CardContent>
            {parentConfirmed ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="size-3.5" />
                تأیید شده توسط ولی
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1">
                <Clock className="size-3.5" />
                در انتظار تأیید ولی
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {!readOnly && (
        <p className="text-muted-foreground text-sm">حالت ویرایش در فاز بعد فعال می‌شود.</p>
      )}
    </div>
  );
}
