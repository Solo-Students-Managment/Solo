import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Exam, ExamAssignment, ExamQuestion } from '@/types'
import {
  calculateExamScore,
  createAssignmentId,
  createExamId,
  emptyExamAnswers,
  normalizeAnswers,
  normalizeExam,
  readAllAssignments,
  readAllExams,
  writeAllAssignments,
  writeAllExams,
} from '@/lib/exams'
import { seedAssignments, seedExams } from '@/mocks/exams'

interface ExamContextValue {
  version: number
  exams: Exam[]
  assignments: ExamAssignment[]
  getExamById: (examId: string) => Exam | undefined
  createExam: (input: Omit<Exam, 'id' | 'createdAt'>) => Exam
  assignExam: (examId: string, studentId: string, teacherId: string) => ExamAssignment | null
  getAssignmentsForStudent: (studentId: string) => ExamAssignment[]
  getAssignmentsForExam: (examId: string) => ExamAssignment[]
  getAssignment: (assignmentId: string) => ExamAssignment | undefined
  startExam: (assignmentId: string) => void
  saveChoiceAnswer: (assignmentId: string, questionId: string, optionIndex: number) => void
  saveTextAnswer: (assignmentId: string, questionId: string, text: string) => void
  submitExam: (assignmentId: string) => number | null
}

const ExamContext = createContext<ExamContextValue | null>(null)

function mergeSeedExams(stored: Exam[]) {
  const storedIds = new Set(stored.map((exam) => exam.id))
  const merged = stored.map(normalizeExam)
  for (const seed of seedExams) {
    if (!storedIds.has(seed.id)) merged.push(normalizeExam(seed))
  }
  return merged
}

function mergeSeedAssignments(stored: ExamAssignment[]) {
  const storedIds = new Set(stored.map((item) => item.id))
  const merged = stored.map((item) => ({
    ...item,
    answers: normalizeAnswers(item.answers),
  }))
  for (const seed of seedAssignments) {
    if (!storedIds.has(seed.id)) {
      merged.push({ ...seed, answers: normalizeAnswers(seed.answers) })
    }
  }
  return merged
}

function getAllExamsMerged() {
  return mergeSeedExams(readAllExams())
}

function getAllAssignmentsMerged() {
  return mergeSeedAssignments(readAllAssignments())
}

export function ExamProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0)

  const bump = useCallback(() => setVersion((current) => current + 1), [])

  const exams = useMemo(() => {
    void version
    return getAllExamsMerged()
  }, [version])

  const assignments = useMemo(() => {
    void version
    return getAllAssignmentsMerged()
  }, [version])

  const getExamById = useCallback(
    (examId: string) => exams.find((exam) => exam.id === examId),
    [exams],
  )

  const createExam = useCallback(
    (input: Omit<Exam, 'id' | 'createdAt'>) => {
      const exam: Exam = {
        ...input,
        id: createExamId(),
        createdAt: new Date().toISOString(),
      }
      writeAllExams([exam, ...readAllExams()])
      bump()
      return exam
    },
    [bump],
  )

  const assignExam = useCallback(
    (examId: string, studentId: string, teacherId: string) => {
      const existing = getAllAssignmentsMerged().find(
        (item) => item.examId === examId && item.studentId === studentId,
      )
      if (existing) return null

      const assignment: ExamAssignment = {
        id: createAssignmentId(),
        examId,
        studentId,
        teacherId,
        assignedAt: new Date().toISOString(),
        status: 'assigned',
        answers: emptyExamAnswers(),
        score: null,
        submittedAt: null,
      }
      writeAllAssignments([assignment, ...readAllAssignments()])
      bump()
      return assignment
    },
    [bump],
  )

  const getAssignmentsForStudent = useCallback(
    (studentId: string) =>
      assignments.filter((assignment) => assignment.studentId === studentId),
    [assignments],
  )

  const getAssignmentsForExam = useCallback(
    (examId: string) => assignments.filter((assignment) => assignment.examId === examId),
    [assignments],
  )

  const getAssignment = useCallback(
    (assignmentId: string) => assignments.find((item) => item.id === assignmentId),
    [assignments],
  )

  const updateAssignment = useCallback(
    (assignmentId: string, updater: (current: ExamAssignment) => ExamAssignment) => {
      const current = getAllAssignmentsMerged().find((item) => item.id === assignmentId)
      if (!current) return

      const updated = updater(current)
      const stored = readAllAssignments()
      const storedIndex = stored.findIndex((item) => item.id === assignmentId)

      if (storedIndex >= 0) {
        const next = [...stored]
        next[storedIndex] = updated
        writeAllAssignments(next)
      } else {
        writeAllAssignments([updated, ...stored])
      }
      bump()
    },
    [bump],
  )

  const startExam = useCallback(
    (assignmentId: string) => {
      updateAssignment(assignmentId, (current) =>
        current.status === 'assigned'
          ? { ...current, status: 'in_progress' }
          : current,
      )
    },
    [updateAssignment],
  )

  const saveChoiceAnswer = useCallback(
    (assignmentId: string, questionId: string, optionIndex: number) => {
      updateAssignment(assignmentId, (current) => ({
        ...current,
        status: current.status === 'assigned' ? 'in_progress' : current.status,
        answers: {
          ...current.answers,
          choices: { ...current.answers.choices, [questionId]: optionIndex },
        },
      }))
    },
    [updateAssignment],
  )

  const saveTextAnswer = useCallback(
    (assignmentId: string, questionId: string, text: string) => {
      updateAssignment(assignmentId, (current) => ({
        ...current,
        status: current.status === 'assigned' ? 'in_progress' : current.status,
        answers: {
          ...current.answers,
          texts: { ...current.answers.texts, [questionId]: text },
        },
      }))
    },
    [updateAssignment],
  )

  const submitExam = useCallback(
    (assignmentId: string) => {
      const assignment = getAllAssignmentsMerged().find((item) => item.id === assignmentId)
      if (!assignment) return null

      const exam = getAllExamsMerged().find((item) => item.id === assignment.examId)
      if (!exam) return null

      const score = calculateExamScore(exam, assignment.answers)
      updateAssignment(assignmentId, (current) => ({
        ...current,
        status: 'completed',
        score,
        submittedAt: new Date().toISOString(),
      }))
      return score
    },
    [updateAssignment],
  )

  const value = useMemo<ExamContextValue>(
    () => ({
      version,
      exams,
      assignments,
      getExamById,
      createExam,
      assignExam,
      getAssignmentsForStudent,
      getAssignmentsForExam,
      getAssignment,
      startExam,
      saveChoiceAnswer,
      saveTextAnswer,
      submitExam,
    }),
    [
      version,
      exams,
      assignments,
      getExamById,
      createExam,
      assignExam,
      getAssignmentsForStudent,
      getAssignmentsForExam,
      getAssignment,
      startExam,
      saveChoiceAnswer,
      saveTextAnswer,
      submitExam,
    ],
  )

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>
}

export function useExams() {
  const context = useContext(ExamContext)
  if (!context) {
    throw new Error('useExams must be used within ExamProvider')
  }
  return context
}

export type { ExamQuestion }
