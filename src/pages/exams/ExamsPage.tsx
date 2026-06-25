import { Link } from 'react-router-dom';
import { ClipboardList, Plus } from 'lucide-react';

import { useExams } from '@/contexts/ExamContext';
import { formatPersianDateTime, formatNumber } from '@/lib/formatters';
import { StudentExamsPage } from '@/pages/exams/StudentExamsPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function ExamsPage() {
  const { user } = useAuth();

  if (user?.role === 'student') {
    return <StudentExamsPage />;
  }

  if (user?.role !== 'teacher') {
    return <p className="text-muted-foreground">دسترسی به آزمون‌ها برای این نقش فعال نیست.</p>;
  }

  return <TeacherExamsPage />;
}

function TeacherExamsPage() {
  const { exams, getAssignmentsForExam } = useExams();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">آزمون‌ها</h2>
          <p className="text-muted-foreground text-sm">تعریف آزمون و اختصاص به زبان‌آموزان</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/exams/new">
            <Plus className="h-4 w-4" />
            آزمون جدید
          </Link>
        </Button>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <ClipboardList className="text-muted-foreground h-10 w-10" />
            <p className="text-muted-foreground">هنوز آزمونی تعریف نشده است.</p>
            <Button asChild>
              <Link to="/dashboard/exams/new">ایجاد اولین آزمون</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => {
            const assignedCount = getAssignmentsForExam(exam.id).length;
            return (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle className="text-base">{exam.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">{exam.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-muted-foreground flex flex-wrap gap-2 text-sm">
                    <Badge variant="secondary">{formatNumber(exam.questions.length)} سوال</Badge>
                    <Badge variant="outline">{formatNumber(exam.durationMinutes)} دقیقه</Badge>
                    <Badge variant="outline">{formatNumber(assignedCount)} اختصاص</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    ایجاد: {formatPersianDateTime(exam.createdAt)}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/dashboard/exams/${exam.id}`}>مشاهده و اختصاص</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
