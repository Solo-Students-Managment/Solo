import type { AdminStats } from '@/types'
import { mockStudents } from './students'
import { getUserById } from './users'

export const mockAdminStats: AdminStats = {
  averageScore: 15.6,
  homeworkCompletionRate: 82,
  attendanceRate: 88,
  parentReportViewRate: 74,
  activeStudents: mockStudents.length,
  totalStudents: mockStudents.length,
  totalTeachers: 1,
  totalParents: 1,
  enrollmentTrend: [
    { month: 'آذر', count: 5 },
    { month: 'دی', count: 6 },
    { month: 'بهمن', count: 6 },
    { month: 'اسفند', count: 7 },
    { month: 'فروردین', count: 8 },
    { month: 'اردیبهشت', count: 8 },
  ],
  monthlyProgress: [
    { month: 'آذر', avgScore: 14.2 },
    { month: 'دی', avgScore: 14.8 },
    { month: 'بهمن', avgScore: 15.1 },
    { month: 'اسفند', avgScore: 15.4 },
    { month: 'فروردین', avgScore: 15.9 },
    { month: 'اردیبهشت', avgScore: 16.2 },
  ],
  homeworkByMonth: [
    { month: 'آذر', rate: 75 },
    { month: 'دی', rate: 78 },
    { month: 'بهمن', rate: 80 },
    { month: 'اسفند', rate: 81 },
    { month: 'فروردین', rate: 83 },
    { month: 'اردیبهشت', rate: 85 },
  ],
  attendanceTrend: [
    { month: 'آذر', rate: 82 },
    { month: 'دی', rate: 84 },
    { month: 'بهمن', rate: 85 },
    { month: 'اسفند', rate: 86 },
    { month: 'فروردین', rate: 87 },
    { month: 'اردیبهشت', rate: 88 },
  ],
  studentRankings: [...mockStudents]
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 10)
    .map((student) => {
      const user = getUserById(student.userId)
      const total =
        student.attendanceStats.present +
        student.attendanceStats.absent +
        student.attendanceStats.late
      return {
        studentId: student.userId,
        name: user?.name ?? 'نامشخص',
        level: student.level,
        avgScore: student.averageScore,
        attendanceRate: total > 0 ? Math.round((student.attendanceStats.present / total) * 100) : 0,
      }
    }),
}
