import { Link } from 'react-router-dom';
import type { Session } from '@/types';
import { useSessionFinalScore } from '@/contexts/SessionScoreContext';
import { useSessionParentConfirmed } from '@/contexts/SessionApprovalContext';
import { formatPersianDate } from '@/lib/formatters';
import { useStudentName, useTeacherName } from '@/hooks/useMockData';
import { AttendanceBadge } from '@/components/shared/AttendanceBadge';
import { ScoreBadge } from '@/components/shared/ScoreBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SessionsTableProps {
  sessions: Session[];
  showStudent?: boolean;
  showConfirmation?: boolean;
}

export function SessionsTable({
  sessions,
  showStudent = false,
  showConfirmation = false,
}: SessionsTableProps) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>تاریخ</TableHead>
            <TableHead>موضوع</TableHead>
            {showStudent && <TableHead>زبان‌آموز</TableHead>}
            <TableHead>مدرس</TableHead>
            <TableHead>حضور</TableHead>
            <TableHead>نمره</TableHead>
            {showConfirmation && <TableHead>وضعیت</TableHead>}
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              showStudent={showStudent}
              showConfirmation={showConfirmation}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SessionRow({
  session,
  showStudent,
  showConfirmation,
}: {
  session: Session;
  showStudent: boolean;
  showConfirmation: boolean;
}) {
  const teacherName = useTeacherName(session.teacherId);
  const studentName = useStudentName(session.studentId);
  const finalScore = useSessionFinalScore(session.id, session.finalScore);
  const parentConfirmed = useSessionParentConfirmed(session.id, session.parentConfirmed);

  return (
    <TableRow>
      <TableCell>{formatPersianDate(session.date)}</TableCell>
      <TableCell>{session.topic}</TableCell>
      {showStudent && <TableCell>{studentName}</TableCell>}
      <TableCell>{teacherName}</TableCell>
      <TableCell>
        <AttendanceBadge status={session.attendanceStatus} />
      </TableCell>
      <TableCell>
        <ScoreBadge score={finalScore} />
      </TableCell>
      {showConfirmation && (
        <TableCell>{parentConfirmed ? 'تأیید شده' : 'در انتظار تأیید'}</TableCell>
      )}
      <TableCell>
        <Link
          to={`/dashboard/sessions/${session.id}`}
          className="text-primary text-sm font-medium hover:underline"
        >
          جزئیات
        </Link>
      </TableCell>
    </TableRow>
  );
}
