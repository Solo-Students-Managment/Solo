import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useExams } from '@/app/providers/ExamContext';
import { countAnsweredQuestions, isQuestionAnswered, normalizeQuestion } from '@/lib/exams';
import { formatNumber, formatScore } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/providers/AuthContext';

export function TakeExamPage() {
  const { assignmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getAssignment, getExamById, startExam, saveChoiceAnswer, saveTextAnswer, submitExam } =
    useExams();

  const assignment = assignmentId ? getAssignment(assignmentId) : undefined;
  const exam = assignment ? getExamById(assignment.examId) : undefined;

  const isInProgress = assignment
    ? assignment.status !== 'completed' && assignment.status !== 'assigned'
    : false;

  const [started, setStarted] = useState(isInProgress);
  const [securityEvents, setSecurityEvents] = useState(0);

  const [secondsRemaining, setSecondsRemaining] = useState(() => (exam?.durationMinutes ?? 0) * 60);

  useEffect(() => {
    if (!started || assignment?.status === 'completed') return;
    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [assignment?.status, started]);

  useEffect(() => {
    if (!started || assignment?.status === 'completed') return;
    const registerSecurityEvent = (event?: Event) => {
      event?.preventDefault();
      setSecurityEvents((current) => current + 1);
      toast.warning('برای امنیت آزمون، کپی/پیست، راست‌کلیک و خروج از صفحه محدود شده است');
    };
    const onVisibilityChange = () => {
      if (document.hidden) registerSecurityEvent();
    };
    document.addEventListener('copy', registerSecurityEvent);
    document.addEventListener('paste', registerSecurityEvent);
    document.addEventListener('cut', registerSecurityEvent);
    document.addEventListener('contextmenu', registerSecurityEvent);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('copy', registerSecurityEvent);
      document.removeEventListener('paste', registerSecurityEvent);
      document.removeEventListener('cut', registerSecurityEvent);
      document.removeEventListener('contextmenu', registerSecurityEvent);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [assignment?.status, started]);

  if (!user || user.role !== 'student') {
    return <p className="text-muted-foreground">فقط زبان‌آموزان می‌توانند آزمون بدهند.</p>;
  }

  if (!assignment || !exam || assignment.studentId !== user.id) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">آزمون یافت نشد.</p>
        <Button asChild variant="outline">
          <Link to="/dashboard/exams">بازگشت</Link>
        </Button>
      </div>
    );
  }

  const questions = exam.questions.map((question) => normalizeQuestion(question));
  const isCompleted = assignment.status === 'completed';
  const answeredCount = countAnsweredQuestions(exam, assignment.answers);
  const allAnswered = questions.every((question) =>
    isQuestionAnswered(question, assignment.answers)
  );

  const handleStart = () => {
    if (!assignmentId) return;
    startExam(assignmentId);
    setStarted(true);
  };

  const handleSubmit = () => {
    if (!assignmentId) return;
    if (!allAnswered) {
      toast.error('لطفاً به همه سوالات پاسخ دهید');
      return;
    }
    const score = submitExam(assignmentId);
    if (score !== null) {
      toast.success(`آزمون ثبت شد — نمره: ${formatScore(score)}`);
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerLabel = `${formatNumber(minutes)}:${String(seconds).padStart(2, '0')}`;

  if (!started && !isCompleted) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" className="ps-0">
          <Link to="/dashboard/exams">
            <ArrowRight className="h-4 w-4" />
            بازگشت
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{exam.title}</CardTitle>
            <p className="text-muted-foreground text-sm">{exam.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{formatNumber(questions.length)} سوال</Badge>
              <Badge variant="outline">{formatNumber(exam.durationMinutes)} دقیقه</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              سوالات شامل چهارگزینه‌ای و پاسخ تشریحی است. پس از تکمیل، آزمون را ثبت کنید.
            </p>
            <Button onClick={handleStart}>شروع آزمون</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="ps-0">
        <Link to="/dashboard/exams">
          <ArrowRight className="h-4 w-4" />
          بازگشت
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{exam.title}</h2>
          {isCompleted && assignment.score !== null && (
            <p className="mt-1 text-sm font-medium text-emerald-700">
              نمره نهایی: {formatScore(assignment.score)}
            </p>
          )}
        </div>
        {!isCompleted && (
          <div className="flex flex-wrap gap-2">
            <Badge variant={secondsRemaining === 0 ? 'danger' : 'warning'}>{timerLabel}</Badge>
            <Badge variant="outline">{formatNumber(securityEvents)} رویداد امنیتی</Badge>
            <Badge variant="warning">
              {formatNumber(answeredCount)} / {formatNumber(questions.length)} پاسخ
            </Badge>
          </div>
        )}
      </div>

      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">
                {formatNumber(index + 1)}. {question.text}
              </CardTitle>
              <Badge variant="outline">
                {question.type === 'choice' ? 'چهارگزینه‌ای' : 'تشریحی'} - وزن{' '}
                {formatNumber(question.scoreWeight ?? 1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {question.type === 'choice' ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option, oIndex) => {
                  const selected = assignment.answers.choices[question.id] === oIndex;
                  const showCorrect = isCompleted && oIndex === question.correctIndex;
                  const showWrong = isCompleted && selected && oIndex !== question.correctIndex;

                  return (
                    <button
                      key={oIndex}
                      type="button"
                      disabled={isCompleted}
                      onClick={() => {
                        if (!assignmentId || isCompleted) return;
                        saveChoiceAnswer(assignmentId, question.id, oIndex);
                      }}
                      className={cn(
                        'rounded-lg border p-3 text-start text-sm transition-colors',
                        selected && 'border-primary bg-primary/5',
                        showCorrect && 'border-emerald-500 bg-emerald-50',
                        showWrong && 'border-red-400 bg-red-50',
                        !isCompleted && 'hover:bg-accent'
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={assignment.answers.texts[question.id] ?? ''}
                  disabled={isCompleted}
                  onChange={(event) => {
                    if (!assignmentId || isCompleted) return;
                    saveTextAnswer(assignmentId, question.id, event.target.value);
                  }}
                  placeholder="پاسخ خود را بنویسید..."
                />
                {isCompleted && question.sampleAnswer && (
                  <p className="text-muted-foreground text-sm">
                    پاسخ نمونه: {question.sampleAnswer}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-3">
        {isCompleted ? (
          <Button onClick={() => navigate('/dashboard/exams')}>بازگشت به لیست</Button>
        ) : (
          <Button onClick={handleSubmit}>ثبت آزمون</Button>
        )}
      </div>
    </div>
  );
}
