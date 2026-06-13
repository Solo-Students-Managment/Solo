import { getAllUsers, getUserById as getUserByIdFromStore } from '@/lib/studentStore'
import {
  DEMO_PARENT_ID,
  DEMO_PASSWORD,
  DEMO_STUDENT_ID,
  DEMO_TEACHER_ID,
  seedUsers,
} from './seedUsers'

export {
  DEMO_PASSWORD,
  DEMO_STUDENT_ID,
  DEMO_PARENT_ID,
  DEMO_TEACHER_ID,
}

export const mockUsers = seedUsers

export function getUserById(id: string) {
  return getUserByIdFromStore(id)
}

export function getUserByCredentials(username: string, password: string) {
  return getAllUsers().find(
    (user) => user.username === username && user.password === password,
  )
}
