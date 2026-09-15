import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useMockData, useStudentName } from '@/hooks/useMockData';
import { getAttendanceRate } from '@/mocks/students';
import { ScoreBadge } from '@/features/shared/components/ScoreBadge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPercent, formatPersianDate } from '@/lib/formatters';
import { getSessionsByStudentId } from '@/mocks/sessions';
import { Button } from '@/components/ui/button';

export function StudentsListPage() {
  const { teacherStudents } = useMockData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">زبان‌آموزان</h2>
          <p className="text-muted-foreground text-sm">لیست زبان‌آموزان کلاس</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/students/new">
            <Plus className="size-4" />
            افزودن زبان‌آموز
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>سطح</TableHead>
                  <TableHead>میانگین نمره</TableHead>
                  <TableHead>حضور</TableHead>
                  <TableHead>آخرین جلسه</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherStudents.map((student) => (
                  <StudentRow key={student.userId} userId={student.userId} student={student} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentRow({
  userId,
  student,
}: {
  userId: string;
  student: {
    level: string;
    averageScore: number;
    attendanceStats: { present: number; absent: number; late: number };
  };
}) {
  const name = useStudentName(userId);
  const rate = getAttendanceRate(student.attendanceStats);
  const sessions = getSessionsByStudentId(userId);
  const lastSession = sessions[0];

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell>{student.level}</TableCell>
      <TableCell>
        <ScoreBadge score={student.averageScore} />
      </TableCell>
      <TableCell>{formatPercent(rate)}</TableCell>
      <TableCell>{lastSession ? formatPersianDate(lastSession.date) : '—'}</TableCell>
      <TableCell>
        <Link
          to={`/dashboard/students/${userId}`}
          className="text-primary text-sm font-medium hover:underline"
        >
          جزئیات
        </Link>
      </TableCell>
    </TableRow>
  );
}
