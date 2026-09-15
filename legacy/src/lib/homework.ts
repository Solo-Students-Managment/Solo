import type { HomeworkTask } from '@/types';

const TASKS_PREFIX = 'hw-tasks-';
const DONE_PREFIX = 'hw-done-';

function tasksKey(sessionId: string) {
  return `${TASKS_PREFIX}${sessionId}`;
}

function doneKey(sessionId: string, studentId: string, taskId: string) {
  return `${DONE_PREFIX}${studentId}-${sessionId}-${taskId}`;
}

export function getDefaultHomeworkTasks(sessionId: string, topic: string): HomeworkTask[] {
  return [
    { id: `${sessionId}-task-1`, title: `تمرین مرتبط با ${topic}` },
    { id: `${sessionId}-task-2`, title: 'مرور واژگان جلسه' },
    { id: `${sessionId}-task-3`, title: 'تمرین listening یا reading' },
  ];
}

export function readStoredTasks(sessionId: string): HomeworkTask[] | null {
  try {
    const raw = localStorage.getItem(tasksKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as HomeworkTask[];
  } catch {
    return null;
  }
}

export function writeStoredTasks(sessionId: string, tasks: HomeworkTask[]) {
  localStorage.setItem(tasksKey(sessionId), JSON.stringify(tasks));
}

export function readTaskCompletion(sessionId: string, studentId: string, taskId: string): boolean {
  return localStorage.getItem(doneKey(sessionId, studentId, taskId)) === 'true';
}

export function writeTaskCompletion(
  sessionId: string,
  studentId: string,
  taskId: string,
  completed: boolean
) {
  localStorage.setItem(doneKey(sessionId, studentId, taskId), String(completed));
}

export function getCompletionSummary(sessionId: string, studentId: string, tasks: HomeworkTask[]) {
  if (tasks.length === 0) {
    return { completed: 0, total: 0, rate: 0, allDone: false };
  }

  const completed = tasks.filter((task) =>
    readTaskCompletion(sessionId, studentId, task.id)
  ).length;

  return {
    completed,
    total: tasks.length,
    rate: Math.round((completed / tasks.length) * 100),
    allDone: completed === tasks.length,
  };
}

export function createTaskId() {
  return `task-${crypto.randomUUID()}`;
}
