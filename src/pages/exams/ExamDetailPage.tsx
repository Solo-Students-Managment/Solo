import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { useExams } from '@/contexts/ExamContext';
import { useMockData, useStudentName } from '@/hooks/useMockData';
import { EXAM_QUESTION_TYPE_LABELS, EXAM_STATUS_LABELS, normalizeQuestion } from '@/lib/exams';
import { formatNumber, formatPersianDateTime, formatScore } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';

export function ExamDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getExamById, getAssignmentsForExam, assignExam } = useExams();
  const { teacherStudents } = useMockData();

  const exam = id ? getExamById(id) : undefined;
  const assignments = id ? getAssignmentsForExam(id) : [];

  if (!exam) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">آزمون یافت نشد.</p>
        <Button asChild variant="outline">
          <Link to="/dashboard/exams">بازگشت</Link>
        </Button>
      </div>
    );
  }

  const assignedStudentIds = new Set(assignments.map((item) => item.studentId));

  const handleAssign = (studentId: string) => {
    if (!user || !id) return;
    const result = assignExam(id, studentId, user.id);
    if (result) {
      toast.success('آزمون به زبان‌آموز اختصاص یافت');
    } else {
      toast.info('این آزمون قبلاً به این زبان‌آموز اختصاص داده شده');
    }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="ps-0">
        <Link to="/dashboard/exams">
          <ArrowRight className="h-4 w-4" />
          بازگشت به آزمون‌ها
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{exam.title}</CardTitle>
          <p className="text-muted-foreground text-sm">{exam.description}</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="secondary">{formatNumber(exam.questions.length)} سوال</Badge>
          <Badge variant="outline">{formatNumber(exam.durationMinutes)} دقیقه</Badge>
          <Badge variant="outline">{formatNumber(assignments.length)} اختصاص</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">سوالات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {exam.questions.map((rawQuestion, index) => {
            const question = normalizeQuestion(rawQuestion);
            return (
              <div key={question.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {index + 1}. {question.text}
                  </p>
                  <Badge variant="outline">{EXAM_QUESTION_TYPE_LABELS[question.type]}</Badge>
                </div>
                {question.type === 'choice' ? (
                  <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                    {question.options.map((option, oIndex) => (
                      <li
                        key={oIndex}
                        className={
                          oIndex === question.correctIndex ? 'font-medium text-emerald-700' : ''
                        }
                      >
                        {oIndex + 1}. {option}
                        {oIndex === question.correctIndex && ' ✓'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground mt-2 text-sm">
                    {question.sampleAnswer
                      ? `پاسخ نمونه: ${question.sampleAnswer}`
                      : 'بدون پاسخ نمونه — هر پاسخ غیرخالی قبول می‌شود'}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">اختصاص به زبان‌آموز</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>سطح</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherStudents.map((student) => (
                  <AssignRow
                    key={student.userId}
                    userId={student.userId}
                    level={student.level}
                    isAssigned={assignedStudentIds.has(student.userId)}
                    onAssign={() => handleAssign(student.userId)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">نتایج اختصاص‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>زبان‌آموز</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>نمره</TableHead>
                    <TableHead>تاریخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <ResultRow key={assignment.id} assignment={assignment} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AssignRow({
  userId,
  level,
  isAssigned,
  onAssign,
}: {
  userId: string;
  level: string;
  isAssigned: boolean;
  onAssign: () => void;
}) {
  const name = useStudentName(userId);

  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell>{level}</TableCell>
      <TableCell>{isAssigned ? 'اختصاص‌یافته' : '—'}</TableCell>
      <TableCell>
        <Button type="button" size="sm" variant="outline" disabled={isAssigned} onClick={onAssign}>
          اختصاص
        </Button>
      </TableCell>
    </TableRow>
  );
}

function ResultRow({
  assignment,
}: {
  assignment: {
    id: string;
    studentId: string;
    status: keyof typeof EXAM_STATUS_LABELS;
    score: number | null;
    submittedAt: string | null;
    assignedAt: string;
  };
}) {
  const name = useStudentName(assignment.studentId);

  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell>{EXAM_STATUS_LABELS[assignment.status]}</TableCell>
      <TableCell>{assignment.score !== null ? formatScore(assignment.score) : '—'}</TableCell>
      <TableCell>
        {assignment.submittedAt
          ? formatPersianDateTime(assignment.submittedAt)
          : formatPersianDateTime(assignment.assignedAt)}
      </TableCell>
    </TableRow>
  );
}
