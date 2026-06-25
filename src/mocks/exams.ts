import type { ChoiceExamQuestion, ExamQuestion, TextExamQuestion } from '@/types';
import { createQuestionId } from '@/lib/exams';

function makeChoiceQuestion(
  text: string,
  options: [string, string, string, string],
  correctIndex: number
): ChoiceExamQuestion {
  return { id: createQuestionId(), type: 'choice', text, options, correctIndex };
}

function makeTextQuestion(text: string, sampleAnswer?: string): TextExamQuestion {
  return { id: createQuestionId(), type: 'text', text, sampleAnswer };
}

export const seedExams = [
  {
    id: 'exam-grammar-b1',
    title: 'آزمون گرامر B1',
    description: 'ارزیابی زمان‌های Present Perfect و Past Simple',
    teacherId: 'user-teacher-1',
    durationMinutes: 30,
    createdAt: '2025-04-01T10:00:00',
    questions: [
      makeChoiceQuestion(
        'کدام جمله از Present Perfect استفاده می‌کند؟',
        [
          'I went to school yesterday.',
          'I have lived here for five years.',
          'She plays tennis every day.',
          'They will arrive tomorrow.',
        ],
        1
      ),
      makeChoiceQuestion(
        'گزینه صحیح: She ___ to London twice.',
        ['go', 'goes', 'has been', 'going'],
        2
      ),
      makeTextQuestion(
        'یک جمله با Present Perfect بنویسید (حداقل ۵ کلمه)',
        'I have studied English for two years.'
      ),
    ] satisfies ExamQuestion[],
  },
  {
    id: 'exam-vocabulary-a2',
    title: 'آزمون واژگان A2',
    description: 'واژگان موضوعات روزمره و خانواده',
    teacherId: 'user-teacher-1',
    durationMinutes: 20,
    createdAt: '2025-04-10T10:00:00',
    questions: [
      makeChoiceQuestion(
        'معادل "کتابخانه" کدام است؟',
        ['Hospital', 'Library', 'Kitchen', 'Station'],
        1
      ),
      makeTextQuestion('کلمه "Brother" را در یک جمله انگلیسی به کار ببرید.'),
    ] satisfies ExamQuestion[],
  },
];

export const seedAssignments = [
  {
    id: 'assign-demo-1',
    examId: 'exam-grammar-b1',
    studentId: 'user-student-1',
    teacherId: 'user-teacher-1',
    assignedAt: '2025-04-15T09:00:00',
    status: 'assigned' as const,
    answers: { choices: {}, texts: {} },
    score: null,
    submittedAt: null,
  },
];
