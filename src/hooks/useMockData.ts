import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { useSessionApproval } from '@/contexts/SessionApprovalContext'
import { useStudents } from '@/contexts/StudentContext'
import { mockAdminStats } from '@/mocks/adminStats'
import { getSessionById, getSessionsByStudentId, getSessionsByTeacherId } from '@/mocks/sessions'
import {
  getAttendanceRate,
  getStudentByUserId,
  getStudentsByParentId,
  getStudentsByTeacherId,
  mockStudents,
} from '@/mocks/students'
import { DEMO_STUDENT_ID, getUserById } from '@/mocks/users'

export function useMockData() {
  const { user } = useAuth()
  const { version: studentsVersion } = useStudents()
  const { version: approvalVersion } = useSessionApproval()
  const { version: chatVersion } = useChat()

  return useMemo(() => {
    if (!user) {
      return {
        currentStudent: null,
        parentChildren: [],
        teacherStudents: [],
        sessions: [],
        messages: [],
        adminStats: mockAdminStats,
      }
    }

    switch (user.role) {
      case 'student': {
        const currentStudent = getStudentByUserId(user.id)
        const sessions = getSessionsByStudentId(user.id)
        return {
          currentStudent,
          parentChildren: [],
          teacherStudents: [],
          sessions,
          messages: [],
          adminStats: mockAdminStats,
        }
      }
      case 'parent': {
        const parentChildren = getStudentsByParentId(user.id)
        const childId = parentChildren[0]?.userId ?? DEMO_STUDENT_ID
        const sessions = getSessionsByStudentId(childId)
        return {
          currentStudent: getStudentByUserId(childId),
          parentChildren,
          teacherStudents: [],
          sessions,
          messages: [],
          adminStats: mockAdminStats,
        }
      }
      case 'teacher': {
        const teacherStudents = getStudentsByTeacherId(user.id)
        const sessions = getSessionsByTeacherId(user.id)
        return {
          currentStudent: null,
          parentChildren: [],
          teacherStudents,
          sessions,
          messages: [],
          adminStats: mockAdminStats,
        }
      }
      case 'admin':
      default:
        return {
          currentStudent: null,
          parentChildren: [],
          teacherStudents: mockStudents,
          sessions: [],
          messages: [],
          adminStats: mockAdminStats,
        }
    }
  }, [user, studentsVersion, approvalVersion, chatVersion])
}

export function useStudentName(studentId: string) {
  return getUserById(studentId)?.name ?? 'نامشخص'
}

export function useTeacherName(teacherId: string) {
  return getUserById(teacherId)?.name ?? 'نامشخص'
}

export function useSession(sessionId: string | undefined) {
  if (!sessionId) return null
  return getSessionById(sessionId) ?? null
}

export { getAttendanceRate }
