import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ChoiceExamQuestion, ExamQuestion, TextExamQuestion } from '@/types';

import { useExams } from '@/contexts/ExamContext';
import { createQuestionId } from '@/lib/exams';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

const emptyChoiceQuestion = (): ChoiceExamQuestion => ({
  id: createQuestionId(),
  type: 'choice',
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
});

const emptyTextQuestion = (): TextExamQuestion => ({
  id: createQuestionId(),
  type: 'text',
  text: '',
  sampleAnswer: '',
});

function isQuestionValid(question: ExamQuestion) {
  if (!question.text.trim()) return false;
  if (question.type === 'choice') {
    return question.options.every((option) => option.trim());
  }
  return true;
}

export function ExamCreatePage() {
  const { user } = useAuth();
  const { createExam } = useExams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [questions, setQuestions] = useState<ExamQuestion[]>([emptyChoiceQuestion()]);

  const updateQuestion = (index: number, patch: Partial<ExamQuestion>) => {
    setQuestions((current) =>
      current.map((question, i) =>
        i === index ? ({ ...question, ...patch } as ExamQuestion) : question
      )
    );
  };

  const changeQuestionType = (index: number, type: 'choice' | 'text') => {
    setQuestions((current) =>
      current.map((question, i) => {
        if (i !== index) return question;
        if (type === question.type) return question;
        return type === 'choice'
          ? { ...emptyChoiceQuestion(), id: question.id, text: question.text }
          : { ...emptyTextQuestion(), id: question.id, text: question.text };
      })
    );
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions((current) =>
      current.map((question, i) => {
        if (i !== qIndex || question.type !== 'choice') return question;
        const options = [...question.options] as [string, string, string, string];
        options[oIndex] = value;
        return { ...question, options };
      })
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || user.role !== 'teacher') return;

    if (!title.trim()) {
      toast.error('عنوان آزمون الزامی است');
      return;
    }

    const validQuestions = questions.filter(isQuestionValid);
    if (validQuestions.length === 0) {
      toast.error('حداقل یک سوال کامل وارد کنید');
      return;
    }

    const exam = createExam({
      title: title.trim(),
      description: description.trim(),
      teacherId: user.id,
      durationMinutes: Number(durationMinutes) || 30,
      questions: validQuestions,
    });

    toast.success('آزمون با موفقیت ایجاد شد');
    navigate(`/dashboard/exams/${exam.id}`);
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="ps-0">
        <Link to="/dashboard/exams">
          <ArrowRight className="h-4 w-4" />
          بازگشت به آزمون‌ها
        </Link>
      </Button>

      <div>
        <h2 className="text-xl font-semibold">ایجاد آزمون جدید</h2>
        <p className="text-muted-foreground text-sm">
          سوالات چهارگزینه‌ای یا پاسخ تشریحی تعریف کنید
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">اطلاعات آزمون</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">عنوان</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">توضیحات</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">مدت (دقیقه)</Label>
              <Input
                id="duration"
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">سوال {qIndex + 1}</CardTitle>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuestions((current) => current.filter((_, i) => i !== qIndex))}
                >
                  <Trash2 className="text-destructive h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>نوع سوال</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) =>
                      changeQuestionType(qIndex, value as 'choice' | 'text')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="choice">چهارگزینه‌ای</SelectItem>
                      <SelectItem value="text">پاسخ تشریحی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>متن سوال</Label>
                <Input
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                />
              </div>

              {question.type === 'choice' ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="space-y-2">
                        <Label>گزینه {oIndex + 1}</Label>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>پاسخ صحیح</Label>
                    <Select
                      value={String(question.correctIndex)}
                      onValueChange={(value) =>
                        updateQuestion(qIndex, { correctIndex: Number(value) })
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3].map((index) => (
                          <SelectItem key={index} value={String(index)}>
                            گزینه {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor={`sample-${question.id}`}>پاسخ نمونه (اختیاری)</Label>
                  <Textarea
                    id={`sample-${question.id}`}
                    value={question.sampleAnswer ?? ''}
                    onChange={(e) => updateQuestion(qIndex, { sampleAnswer: e.target.value })}
                    placeholder="برای نمره‌دهی خودکار، پاسخ مورد انتظار را وارد کنید"
                  />
                  <p className="text-muted-foreground text-xs">
                    اگر پاسخ نمونه وارد نشود، هر پاسخ غیرخالی نمره کامل می‌گیرد.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setQuestions((current) => [...current, emptyChoiceQuestion()])}
          >
            <Plus className="h-4 w-4" />
            سوال چهارگزینه‌ای
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setQuestions((current) => [...current, emptyTextQuestion()])}
          >
            <Plus className="h-4 w-4" />
            سوال تشریحی
          </Button>
        </div>

        <div className="flex justify-end">
          <Button type="submit">ذخیره آزمون</Button>
        </div>
      </form>
    </div>
  );
}
