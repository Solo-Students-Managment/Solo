import type { User } from '@/types'

export const DEMO_PASSWORD = 'demo123'

export const DEMO_STUDENT_ID = 'user-student-1'
export const DEMO_PARENT_ID = 'user-parent-1'
export const DEMO_TEACHER_ID = 'user-teacher-1'

export const seedUsers: User[] = [
  {
    id: DEMO_STUDENT_ID,
    name: 'علی رضایی',
    role: 'student',
    username: 'student@demo.local',
    password: DEMO_PASSWORD,
  },
  {
    id: DEMO_PARENT_ID,
    name: 'مریم رضایی',
    role: 'parent',
    username: 'parent@demo.local',
    password: DEMO_PASSWORD,
  },
  {
    id: DEMO_TEACHER_ID,
    name: 'سارا احمدی',
    role: 'teacher',
    username: 'teacher@demo.local',
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-admin-1',
    name: 'محمد کریمی',
    role: 'admin',
    username: 'admin@demo.local',
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-student-2',
    name: 'نرگس محمدی',
    role: 'student',
    username: 'narges@demo.local',
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-student-3',
    name: 'امیر حسینی',
    role: 'student',
    username: 'amir@demo.local',
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-student-4',
    name: 'زهرا موسوی',
    role: 'student',
    username: 'zahra@demo.local',
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-student-5',
    name: 'پارسا نوری',
    role: 'student',
    username: 'parsa@demo.local',
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-student-6',
    name: 'سارا جعفری',
    role: 'student',
    username: 'sara@demo.local',
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-student-7',
    name: 'رضا اکبری',
    role: 'student',
    username: 'reza@demo.local',
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-student-8',
    name: 'فاطمه کاظمی',
    role: 'student',
    username: 'fateme@demo.local',
    password: DEMO_PASSWORD,
  },
]
