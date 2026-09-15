import { Link } from 'react-router-dom';

import { useExams } from '@/app/providers/ExamContext';
import { EXAM_STATUS_LABELS } from '@/lib/exams';
import { formatPersianDateTime, formatScore } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/app/providers/AuthContext';

const statusVariant = {
  assigned: 'warning' as const,
  in_progress: 'secondary' as const,
  completed: 'success' as const,
};

export function StudentExamsPage() {
  const { user } = useAuth();
  const { getAssignmentsForStudent, getExamById } = useExams();

  const assignments = user ? getAssignmentsForStudent(user.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">آزمون‌های من</h2>
        <p className="text-muted-foreground text-sm">آزمون‌های اختصاص‌یافته توسط مدرس</p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center">
            هنوز آزمونی به شما اختصاص داده نشده است.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => {
            const exam = getExamById(assignment.examId);
            if (!exam) return null;

            return (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{exam.title}</CardTitle>
                    <Badge variant={statusVariant[assignment.status]}>
                      {EXAM_STATUS_LABELS[assignment.status]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{exam.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-xs">
                    اختصاص: {formatPersianDateTime(assignment.assignedAt)}
                  </p>
                  {assignment.status === 'completed' && assignment.score !== null && (
                    <p className="text-sm font-medium">نمره: {formatScore(assignment.score)}</p>
                  )}
                  {assignment.status === 'completed' ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/dashboard/exams/take/${assignment.id}`}>مشاهده نتیجه</Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link to={`/dashboard/exams/take/${assignment.id}`}>
                        {assignment.status === 'in_progress' ? 'ادامه آزمون' : 'شروع آزمون'}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
