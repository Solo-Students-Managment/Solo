import type { StudentProfile, User, UserRole } from '@/types';
import { seedStudents } from '@/mocks/seedStudents';
import { DEMO_PASSWORD, seedUsers } from '@/mocks/seedUsers';

const STORED_USERS_KEY = 'custom-users';
const STORED_STUDENTS_KEY = 'custom-students';
const DELETED_USERS_KEY = 'deleted-user-ids';
const DELETED_STUDENTS_KEY = 'deleted-student-ids';
const USER_PATCHES_KEY = 'user-patches';
const STUDENT_PATCHES_KEY = 'student-patches';

export interface CreateStudentInput {
  name: string;
  level: string;
  username: string;
  parentName?: string;
  parentUsername?: string;
  parentId?: string;
  teacherId: string;
  sessionsRemaining?: number;
}

export interface CreateUserInput {
  name: string;
  username: string;
  role: UserRole;
  password?: string;
}

export interface UpdateUserInput {
  name?: string;
  username?: string;
  password?: string;
}

export interface UpdateStudentInput {
  level?: string;
  teacherId?: string;
  parentId?: string;
  sessionsRemaining?: number;
  sessionsCompleted?: number;
  averageScore?: number;
}

function readJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeJson<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readIdSet(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set<string>();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set<string>();
  }
}

function writeIdSet(key: string, ids: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...ids]));
}

function readPatches<T>(key: string): Record<string, Partial<T>> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Partial<T>>;
  } catch {
    return {};
  }
}

function writePatches<T>(key: string, patches: Record<string, Partial<T>>) {
  localStorage.setItem(key, JSON.stringify(patches));
}

export function getStoredUsers() {
  return readJson<User>(STORED_USERS_KEY);
}

export function getStoredStudents() {
  return readJson<StudentProfile>(STORED_STUDENTS_KEY);
}

function applyUserPatch(user: User, patches: Record<string, Partial<User>>) {
  const patch = patches[user.id];
  return patch ? { ...user, ...patch } : user;
}

function applyStudentPatch(
  student: StudentProfile,
  patches: Record<string, Partial<StudentProfile>>
) {
  const patch = patches[student.userId];
  return patch ? { ...student, ...patch } : student;
}

export function getAllUsers(): User[] {
  const deleted = readIdSet(DELETED_USERS_KEY);
  const patches = readPatches<User>(USER_PATCHES_KEY);
  const stored = getStoredUsers();
  const storedIds = new Set(stored.map((user) => user.id));
  const seed = seedUsers
    .filter((user) => !deleted.has(user.id) && !storedIds.has(user.id))
    .map((user) => applyUserPatch(user, patches));
  const custom = stored
    .filter((user) => !deleted.has(user.id))
    .map((user) => applyUserPatch(user, patches));
  return [...custom, ...seed];
}

export function getAllStudents(): StudentProfile[] {
  const deleted = readIdSet(DELETED_STUDENTS_KEY);
  const patches = readPatches<StudentProfile>(STUDENT_PATCHES_KEY);
  const stored = getStoredStudents();
  const storedIds = new Set(stored.map((student) => student.userId));
  const seed = seedStudents
    .filter((student) => !deleted.has(student.userId) && !storedIds.has(student.userId))
    .map((student) => applyStudentPatch(student, patches));
  const custom = stored
    .filter((student) => !deleted.has(student.userId))
    .map((student) => applyStudentPatch(student, patches));
  return [...custom, ...seed];
}

export function getUsersByRole(role: UserRole) {
  return getAllUsers().filter((user) => user.role === role);
}

export function getUserById(id: string) {
  return getAllUsers().find((user) => user.id === id);
}

export function getUserByUsername(username: string) {
  return getAllUsers().find((user) => user.username === username);
}

export function getStudentByUserId(userId: string) {
  return getAllStudents().find((student) => student.userId === userId);
}

export function getStudentsByTeacherId(teacherId: string) {
  return getAllStudents().filter((student) => student.teacherId === teacherId);
}

export function getStudentsByParentId(parentId: string) {
  return getAllStudents().filter((student) => student.parentId === parentId);
}

export function createStudentId() {
  return `user-student-${crypto.randomUUID()}`;
}

export function createParentId() {
  return `user-parent-${crypto.randomUUID()}`;
}

export function createTeacherId() {
  return `user-teacher-${crypto.randomUUID()}`;
}

function assertUniqueUsername(username: string, excludeId?: string) {
  const existing = getUserByUsername(username.trim());
  if (existing && existing.id !== excludeId) {
    throw new Error('duplicate_username');
  }
}

function isSeedUser(id: string) {
  return seedUsers.some((user) => user.id === id);
}

export function createUser(input: CreateUserInput) {
  assertUniqueUsername(input.username);
  const rolePrefix =
    input.role === 'teacher'
      ? 'teacher'
      : input.role === 'parent'
        ? 'parent'
        : input.role === 'student'
          ? 'student'
          : 'admin';
  const user: User = {
    id: `user-${rolePrefix}-${crypto.randomUUID()}`,
    name: input.name.trim(),
    role: input.role,
    username: input.username.trim(),
    password: input.password ?? DEMO_PASSWORD,
  };
  const storedUsers = getStoredUsers();
  storedUsers.unshift(user);
  writeJson(STORED_USERS_KEY, storedUsers);
  return user;
}

export function createTeacher(input: { name: string; username: string }) {
  return createUser({ ...input, role: 'teacher' });
}

export function createParent(input: { name: string; username: string }) {
  return createUser({ ...input, role: 'parent' });
}

export function updateUser(userId: string, input: UpdateUserInput) {
  const user = getUserById(userId);
  if (!user) throw new Error('user_not_found');
  if (input.username) assertUniqueUsername(input.username, userId);

  const patch: Partial<User> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.username !== undefined) patch.username = input.username.trim();
  if (input.password !== undefined) patch.password = input.password;

  const storedUsers = getStoredUsers();
  const storedIndex = storedUsers.findIndex((item) => item.id === userId);
  if (storedIndex >= 0) {
    storedUsers[storedIndex] = { ...storedUsers[storedIndex], ...patch };
    writeJson(STORED_USERS_KEY, storedUsers);
    return storedUsers[storedIndex];
  }

  const patches = readPatches<User>(USER_PATCHES_KEY);
  patches[userId] = { ...patches[userId], ...patch };
  writePatches(USER_PATCHES_KEY, patches);
  return { ...user, ...patch };
}

export function deleteUser(userId: string) {
  const user = getUserById(userId);
  if (!user) throw new Error('user_not_found');
  if (user.role === 'admin') throw new Error('cannot_delete_admin');

  const storedUsers = getStoredUsers();
  const nextStored = storedUsers.filter((item) => item.id !== userId);
  if (nextStored.length !== storedUsers.length) {
    writeJson(STORED_USERS_KEY, nextStored);
  }

  const deleted = readIdSet(DELETED_USERS_KEY);
  deleted.add(userId);
  writeIdSet(DELETED_USERS_KEY, deleted);

  if (user.role === 'student') {
    deleteStudent(userId);
  }
}

export function createStudent(input: CreateStudentInput) {
  assertUniqueUsername(input.username);

  const studentUserId = createStudentId();
  const studentUser: User = {
    id: studentUserId,
    name: input.name.trim(),
    role: 'student',
    username: input.username.trim(),
    password: DEMO_PASSWORD,
  };

  let parentId = input.parentId ?? `user-parent-${studentUserId}`;
  const storedUsers = getStoredUsers();
  const storedStudents = getStoredStudents();

  if (!input.parentId && input.parentName?.trim()) {
    const parentUsername = input.parentUsername?.trim();
    if (parentUsername) assertUniqueUsername(parentUsername);

    parentId = createParentId();
    const parentUser: User = {
      id: parentId,
      name: input.parentName.trim(),
      role: 'parent',
      username: parentUsername ?? `${parentId}@demo.local`,
      password: DEMO_PASSWORD,
    };
    storedUsers.unshift(parentUser);
  }

  const profile: StudentProfile = {
    userId: studentUserId,
    level: input.level,
    parentId,
    teacherId: input.teacherId,
    sessionsCompleted: 0,
    sessionsRemaining: input.sessionsRemaining ?? 20,
    attendanceStats: { present: 0, absent: 0, late: 0 },
    averageScore: 0,
  };

  storedUsers.unshift(studentUser);
  storedStudents.unshift(profile);

  writeJson(STORED_USERS_KEY, storedUsers);
  writeJson(STORED_STUDENTS_KEY, storedStudents);

  return { user: studentUser, profile, defaultPassword: DEMO_PASSWORD };
}

export function updateStudent(userId: string, input: UpdateStudentInput) {
  const student = getStudentByUserId(userId);
  if (!student) throw new Error('student_not_found');

  const patch: Partial<StudentProfile> = { ...input };
  const storedStudents = getStoredStudents();
  const storedIndex = storedStudents.findIndex((item) => item.userId === userId);

  if (storedIndex >= 0) {
    storedStudents[storedIndex] = { ...storedStudents[storedIndex], ...patch };
    writeJson(STORED_STUDENTS_KEY, storedStudents);
    return storedStudents[storedIndex];
  }

  const patches = readPatches<StudentProfile>(STUDENT_PATCHES_KEY);
  patches[userId] = { ...patches[userId], ...patch };
  writePatches(STUDENT_PATCHES_KEY, patches);
  return { ...student, ...patch };
}

export function deleteStudent(userId: string) {
  const student = getStudentByUserId(userId);
  if (!student) throw new Error('student_not_found');

  const storedStudents = getStoredStudents();
  const nextStored = storedStudents.filter((item) => item.userId !== userId);
  if (nextStored.length !== storedStudents.length) {
    writeJson(STORED_STUDENTS_KEY, nextStored);
  }

  const deleted = readIdSet(DELETED_STUDENTS_KEY);
  deleted.add(userId);
  writeIdSet(DELETED_STUDENTS_KEY, deleted);

  if (!isSeedUser(userId)) {
    const storedUsers = getStoredUsers();
    writeJson(
      STORED_USERS_KEY,
      storedUsers.filter((item) => item.id !== userId)
    );
  } else {
    const deletedUsers = readIdSet(DELETED_USERS_KEY);
    deletedUsers.add(userId);
    writeIdSet(DELETED_USERS_KEY, deletedUsers);
  }
}

export const STUDENT_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export { DEMO_PASSWORD };
