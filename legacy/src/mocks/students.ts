import type { StudentProfile } from '@/types';
import {
  getAllStudents,
  getStudentByUserId as getStudentByUserIdFromStore,
  getStudentsByParentId as getStudentsByParentIdFromStore,
  getStudentsByTeacherId as getStudentsByTeacherIdFromStore,
} from '@/lib/studentStore';
import { seedStudents } from './seedStudents';

export const mockStudents = seedStudents;

export function getStudentByUserId(userId: string) {
  return getStudentByUserIdFromStore(userId);
}

export function getStudentsByTeacherId(teacherId: string) {
  return getStudentsByTeacherIdFromStore(teacherId);
}

export function getStudentsByParentId(parentId: string) {
  return getStudentsByParentIdFromStore(parentId);
}

export function getAttendanceRate(stats: StudentProfile['attendanceStats']) {
  const total = stats.present + stats.absent + stats.late;
  if (total === 0) return 0;
  return Math.round((stats.present / total) * 100);
}

export { getAllStudents };
