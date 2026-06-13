import type { Session } from '@/types'
import { getDefaultHomeworkTasks } from '@/lib/homework'
import { DEMO_STUDENT_ID, DEMO_TEACHER_ID } from './users'

function createSession(
  id: string,
  studentId: string,
  date: string,
  topic: string,
  attendanceStatus: Session['attendanceStatus'],
  scores: {
    homework: number
    participation: number
    speaking: number
    teacherNote: number
  },
  overrides?: Partial<Session>,
): Session {
  const finalScore =
    scores.homework * 0.4 +
    scores.participation * 0.2 +
    scores.speaking * 0.3 +
    scores.teacherNote * 0.1

  return {
    id,
    studentId,
    teacherId: DEMO_TEACHER_ID,
    date,
    topic,
    attendanceStatus,
    homework: {
      title: 'تمرین گرامر و واژگان',
      description: 'تکمیل تمرینات فصل ۵ و نوشتن ۵ جمله با ساختار Present Perfect',
      fileUrl: '/files/homework-sample.pdf',
      tasks: getDefaultHomeworkTasks(id, topic),
      status: scores.homework >= 12 ? 'done' : 'not_done',
      score: scores.homework,
      teacherNote: 'تمرین به‌خوبی انجام شده است.',
    },
    participation: {
      participated: scores.participation >= 10,
      score: scores.participation,
      teacherNote: scores.participation >= 14 ? 'مشارکت فعال در بحث کلاسی' : 'نیاز به مشارکت بیشتر',
    },
    speaking: {
      questions: [
        'Describe your daily routine.',
        'What did you do last weekend?',
        'Talk about your favorite hobby.',
      ],
      score: scores.speaking,
      feedback: 'تلفظ خوب است. روی روان‌تر صحبت کردن تمرکز کنید.',
    },
    teacherEvaluation: {
      strengths: ['واژگان خوب', 'تمرین منظم'],
      weaknesses: ['گرامر زمان‌ها', 'اعتماد به نفس در speaking'],
      nextSessionRecommendation: 'تمرین مکالمه روی موضوعات روزمره',
      teacherNoteScore: scores.teacherNote,
    },
    finalScore: Math.round(finalScore * 10) / 10,
    parentConfirmed: overrides?.parentConfirmed ?? Math.random() > 0.3,
    ...overrides,
  }
}

export const mockSessions: Session[] = [
  createSession('session-1', DEMO_STUDENT_ID, '2025-03-01', 'Present Perfect', 'present', {
    homework: 17,
    participation: 16,
    speaking: 15,
    teacherNote: 16,
  }),
  createSession('session-2', DEMO_STUDENT_ID, '2025-03-08', 'Conversation: Travel', 'present', {
    homework: 16,
    participation: 18,
    speaking: 17,
    teacherNote: 17,
  }),
  createSession('session-3', DEMO_STUDENT_ID, '2025-03-15', 'Reading Comprehension', 'late', {
    homework: 15,
    participation: 14,
    speaking: 14,
    teacherNote: 15,
  }),
  createSession('session-4', DEMO_STUDENT_ID, '2025-03-22', 'Listening Skills', 'present', {
    homework: 18,
    participation: 17,
    speaking: 16,
    teacherNote: 18,
  }),
  createSession('session-5', DEMO_STUDENT_ID, '2025-03-29', 'Writing: Email', 'present', {
    homework: 17,
    participation: 16,
    speaking: 18,
    teacherNote: 16,
  }),
  createSession('session-6', DEMO_STUDENT_ID, '2025-04-05', 'Phrasal Verbs', 'absent', {
    homework: 0,
    participation: 0,
    speaking: 0,
    teacherNote: 0,
  }, {
    homework: {
      title: 'تمرین گرامر و واژگان',
      description: 'غایب — تکلیف ثبت نشده',
      tasks: [],
      status: 'not_done',
      score: 0,
      teacherNote: 'جلسه غیبت',
    },
    participation: { participated: false, score: 0, teacherNote: 'غایب' },
    speaking: { questions: [], score: 0, feedback: 'غایب' },
    teacherEvaluation: {
      strengths: [],
      weaknesses: ['غیبت'],
      nextSessionRecommendation: 'مرور مطالب جلسه قبل',
      teacherNoteScore: 0,
    },
    finalScore: 0,
    parentConfirmed: false,
  }),
  createSession('session-7', DEMO_STUDENT_ID, '2025-04-12', 'Speaking Practice', 'present', {
    homework: 16,
    participation: 17,
    speaking: 17,
    teacherNote: 17,
  }),
  createSession('session-8', DEMO_STUDENT_ID, '2025-04-19', 'Mid-term Review', 'present', {
    homework: 19,
    participation: 18,
    speaking: 18,
    teacherNote: 19,
  }),
  createSession('session-9', 'user-student-2', '2025-04-12', 'Basic Grammar', 'present', {
    homework: 14,
    participation: 15,
    speaking: 14,
    teacherNote: 15,
  }),
  createSession('session-10', 'user-student-3', '2025-04-12', 'Advanced Discussion', 'present', {
    homework: 18,
    participation: 19,
    speaking: 18,
    teacherNote: 18,
  }),
  createSession('session-11', 'user-student-4', '2025-04-12', 'Alphabet & Numbers', 'present', {
    homework: 12,
    participation: 13,
    speaking: 11,
    teacherNote: 12,
  }),
  createSession('session-12', 'user-student-5', '2025-04-12', 'Conditionals', 'late', {
    homework: 13,
    participation: 12,
    speaking: 13,
    teacherNote: 13,
  }),
  createSession('session-13', 'user-student-6', '2025-04-12', 'Daily Routines', 'present', {
    homework: 16,
    participation: 16,
    speaking: 15,
    teacherNote: 16,
  }),
  createSession('session-14', 'user-student-7', '2025-04-12', 'Debate Skills', 'absent', {
    homework: 0,
    participation: 0,
    speaking: 0,
    teacherNote: 0,
  }, {
    homework: {
      title: 'تمرین گرامر و واژگان',
      description: 'غایب',
      tasks: [],
      status: 'not_done',
      score: 0,
      teacherNote: 'غایب',
    },
    participation: { participated: false, score: 0, teacherNote: 'غایب' },
    speaking: { questions: [], score: 0, feedback: 'غایب' },
    teacherEvaluation: {
      strengths: [],
      weaknesses: ['غیبت مکرر'],
      nextSessionRecommendation: 'پیگیری حضور',
      teacherNoteScore: 0,
    },
    finalScore: 0,
  }),
  createSession('session-15', 'user-student-8', '2025-04-12', 'Presentation Skills', 'present', {
    homework: 19,
    participation: 18,
    speaking: 19,
    teacherNote: 18,
  }),
  createSession('session-16', DEMO_STUDENT_ID, '2025-04-26', 'Future Tenses', 'present', {
    homework: 17,
    participation: 16,
    speaking: 16,
    teacherNote: 17,
  }, { parentConfirmed: false }),
  createSession('session-17', 'user-student-2', '2025-04-19', 'Vocabulary Building', 'present', {
    homework: 15,
    participation: 14,
    speaking: 15,
    teacherNote: 14,
  }),
  createSession('session-18', 'user-student-3', '2025-04-19', 'Essay Writing', 'present', {
    homework: 17,
    participation: 18,
    speaking: 17,
    teacherNote: 18,
  }),
]

export function getSessionsByStudentId(studentId: string) {
  return mockSessions
    .filter((session) => session.studentId === studentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getSessionById(id: string) {
  return mockSessions.find((session) => session.id === id)
}

export function getSessionsByTeacherId(teacherId: string) {
  return mockSessions
    .filter((session) => session.teacherId === teacherId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getRecentSessions(limit = 5) {
  return [...mockSessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}
