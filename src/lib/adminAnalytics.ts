import type { AdminStats } from '@/types'
import { getAllStudents, getAllUsers, getUserById } from '@/lib/studentStore'
import { mockAdminStats } from '@/mocks/adminStats'

function getAttendanceRate(stats: { present: number; absent: number; late: number }) {
  const total = stats.present + stats.absent + stats.late
  if (total === 0) return 0
  return Math.round((stats.present / total) * 100)
}

export function computeAdminStats(): AdminStats {
  const students = getAllStudents()
  const users = getAllUsers()
  const teachers = users.filter((user) => user.role === 'teacher')
  const parents = users.filter((user) => user.role === 'parent')

  const averageScore =
    students.length > 0
      ? Math.round((students.reduce((sum, s) => sum + s.averageScore, 0) / students.length) * 10) / 10
      : 0

  const attendanceRate =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + getAttendanceRate(s.attendanceStats), 0) / students.length,
        )
      : 0

  const studentRankings = [...students]
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 10)
    .map((student) => ({
      studentId: student.userId,
      name: getUserById(student.userId)?.name ?? 'نامشخص',
      level: student.level,
      avgScore: student.averageScore,
      attendanceRate: getAttendanceRate(student.attendanceStats),
    }))

  return {
    ...mockAdminStats,
    averageScore: averageScore || mockAdminStats.averageScore,
    attendanceRate: attendanceRate || mockAdminStats.attendanceRate,
    activeStudents: students.length,
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalParents: parents.length,
    studentRankings: studentRankings.length > 0 ? studentRankings : mockAdminStats.studentRankings,
    enrollmentTrend: mockAdminStats.monthlyProgress.map((item, index) => ({
      month: item.month,
      count: Math.max(1, students.length - (5 - index)),
    })),
  }
}
