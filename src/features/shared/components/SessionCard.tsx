import { Link } from 'react-router-dom';
import type { Session } from '@/types';
import { useSessionFinalScore } from '@/app/providers/SessionScoreContext';
import { useSessionParentConfirmed } from '@/app/providers/SessionApprovalContext';
import { formatPersianDate } from '@/lib/formatters';
import { useTeacherName } from '@/hooks/useMockData';
import { AttendanceBadge } from '@/features/shared/components/AttendanceBadge';
import { ScoreBadge } from '@/features/shared/components/ScoreBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionCardProps {
  session: Session;
  showConfirmation?: boolean;
}

export function SessionCard({ session, showConfirmation = false }: SessionCardProps) {
  const teacherName = useTeacherName(session.teacherId);
  const finalScore = useSessionFinalScore(session.id, session.finalScore);
  const parentConfirmed = useSessionParentConfirmed(session.id, session.parentConfirmed);

  return (
    <Link to={`/dashboard/sessions/${session.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{session.topic}</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                {formatPersianDate(session.date)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <AttendanceBadge status={session.attendanceStatus} />
              {showConfirmation && !parentConfirmed && (
                <Badge variant="warning">نیاز به تأیید</Badge>
              )}
              {showConfirmation && parentConfirmed && <Badge variant="success">تأیید شده</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-0">
          <span className="text-muted-foreground text-sm">مدرس: {teacherName}</span>
          <ScoreBadge score={finalScore} />
        </CardContent>
      </Card>
    </Link>
  );
}
