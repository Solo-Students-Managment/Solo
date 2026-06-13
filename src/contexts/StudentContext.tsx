import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { StudentProfile, User } from '@/types'
import {
  createParent,
  createStudent,
  createTeacher,
  createUser,
  deleteStudent,
  deleteUser,
  getAllStudents,
  getAllUsers,
  getStudentByUserId,
  getStudentsByParentId,
  getStudentsByTeacherId,
  getUsersByRole,
  updateStudent,
  updateUser,
  type CreateStudentInput,
  type CreateUserInput,
  type UpdateStudentInput,
  type UpdateUserInput,
} from '@/lib/studentStore'

interface StudentContextValue {
  version: number
  users: User[]
  students: StudentProfile[]
  addStudent: (input: CreateStudentInput) => ReturnType<typeof createStudent>
  createTeacher: (input: { name: string; username: string }) => User
  createParent: (input: { name: string; username: string }) => User
  createUser: (input: CreateUserInput) => User
  updateUser: (userId: string, input: UpdateUserInput) => User
  deleteUser: (userId: string) => void
  updateStudent: (userId: string, input: UpdateStudentInput) => StudentProfile
  deleteStudent: (userId: string) => void
  getUsersByRole: (role: User['role']) => User[]
  getStudentByUserId: (userId: string) => StudentProfile | undefined
  getStudentsByTeacherId: (teacherId: string) => StudentProfile[]
  getStudentsByParentId: (parentId: string) => StudentProfile[]
}

const StudentContext = createContext<StudentContextValue | null>(null)

export function StudentProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((current) => current + 1), [])

  const users = useMemo(() => {
    void version
    return getAllUsers()
  }, [version])

  const students = useMemo(() => {
    void version
    return getAllStudents()
  }, [version])

  const wrap = useCallback(<T,>(fn: () => T) => {
    const result = fn()
    bump()
    return result
  }, [bump])

  const value = useMemo<StudentContextValue>(
    () => ({
      version,
      users,
      students,
      addStudent: (input) => wrap(() => createStudent(input)),
      createTeacher: (input) => wrap(() => createTeacher(input)),
      createParent: (input) => wrap(() => createParent(input)),
      createUser: (input) => wrap(() => createUser(input)),
      updateUser: (userId, input) => wrap(() => updateUser(userId, input)),
      deleteUser: (userId) => wrap(() => deleteUser(userId)),
      updateStudent: (userId, input) => wrap(() => updateStudent(userId, input)),
      deleteStudent: (userId) => wrap(() => deleteStudent(userId)),
      getUsersByRole: (role) => getUsersByRole(role),
      getStudentByUserId: (userId) => getStudentByUserId(userId),
      getStudentsByTeacherId: (teacherId) => getStudentsByTeacherId(teacherId),
      getStudentsByParentId: (parentId) => getStudentsByParentId(parentId),
    }),
    [version, users, students, wrap],
  )

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
}

export function useStudents() {
  const context = useContext(StudentContext)
  if (!context) {
    throw new Error('useStudents must be used within StudentProvider')
  }
  return context
}
