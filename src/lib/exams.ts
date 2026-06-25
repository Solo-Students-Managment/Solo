import type { Exam, ExamAnswers, ExamAssignment, ExamQuestion, TextExamQuestion } from '@/types';

const EXAMS_KEY = 'exam-definitions';
const ASSIGNMENTS_KEY = 'exam-assignments';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readAllExams(): Exam[] {
  return readJson<Exam[]>(EXAMS_KEY, []);
}

export function writeAllExams(exams: Exam[]) {
  writeJson(EXAMS_KEY, exams);
}

export function readAllAssignments(): ExamAssignment[] {
  return readJson<ExamAssignment[]>(ASSIGNMENTS_KEY, []);
}

export function writeAllAssignments(assignments: ExamAssignment[]) {
  writeJson(ASSIGNMENTS_KEY, assignments);
}

export function createExamId() {
  return `exam-${crypto.randomUUID()}`;
}

export function createAssignmentId() {
  return `assign-${crypto.randomUUID()}`;
}

export function createQuestionId() {
  return `q-${crypto.randomUUID()}`;
}

export function emptyExamAnswers(): ExamAnswers {
  return { choices: {}, texts: {} };
}

type LegacyQuestion = {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
};

export function normalizeQuestion(question: ExamQuestion | LegacyQuestion): ExamQuestion {
  if ('type' in question) {
    return question;
  }
  return {
    id: question.id,
    type: 'choice',
    text: question.text,
    options: question.options,
    correctIndex: question.correctIndex,
  };
}

export function normalizeExam(exam: Exam): Exam {
  return {
    ...exam,
    questions: exam.questions.map((question) =>
      normalizeQuestion(question as ExamQuestion | LegacyQuestion)
    ),
  };
}

export function normalizeAnswers(
  answers: ExamAnswers | Record<string, number> | undefined
): ExamAnswers {
  if (!answers) return emptyExamAnswers();
  if (isExamAnswers(answers)) return answers;
  return { choices: answers, texts: {} };
}

function isExamAnswers(answers: ExamAnswers | Record<string, number>): answers is ExamAnswers {
  return 'choices' in answers && 'texts' in answers;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function isTextAnswerCorrect(question: TextExamQuestion, answer: string) {
  const trimmed = answer.trim();
  if (!trimmed) return false;
  if (!question.sampleAnswer?.trim()) return true;
  return normalizeText(trimmed) === normalizeText(question.sampleAnswer);
}

export function isQuestionAnswered(question: ExamQuestion, answers: ExamAnswers) {
  switch (question.type) {
    case 'choice':
      return answers.choices[question.id] !== undefined;
    case 'text':
      return Boolean(answers.texts[question.id]?.trim());
    default: {
      const _exhaustive: never = question;
      void _exhaustive;
      return false;
    }
  }
}

export function countAnsweredQuestions(exam: Exam, answers: ExamAnswers) {
  const normalized = exam.questions.map((question) => normalizeQuestion(question));
  return normalized.filter((question) => isQuestionAnswered(question, answers)).length;
}

export function calculateExamScore(exam: Exam, answers: ExamAnswers): number {
  const normalizedAnswers = normalizeAnswers(answers);
  const questions = exam.questions.map((question) => normalizeQuestion(question));
  if (questions.length === 0) return 0;

  const correct = questions.filter((question) => {
    switch (question.type) {
      case 'choice':
        return normalizedAnswers.choices[question.id] === question.correctIndex;
      case 'text':
        return isTextAnswerCorrect(question, normalizedAnswers.texts[question.id] ?? '');
      default: {
        const _exhaustive: never = question;
        void _exhaustive;
        return false;
      }
    }
  }).length;

  return Math.round((correct / questions.length) * 20 * 10) / 10;
}

export const EXAM_STATUS_LABELS = {
  assigned: 'اختصاص‌یافته',
  in_progress: 'در حال انجام',
  completed: 'تکمیل‌شده',
} as const;

export const EXAM_QUESTION_TYPE_LABELS = {
  choice: 'چهارگزینه‌ای',
  text: 'پاسخ تشریحی',
} as const;
