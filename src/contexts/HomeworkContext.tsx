import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { HomeworkTask } from '@/types'
import {
  getCompletionSummary,
  readStoredTasks,
  readTaskCompletion,
  writeStoredTasks,
  writeTaskCompletion,
} from '@/lib/homework'

interface HomeworkContextValue {
  version: number
  getTasks: (sessionId: string, defaultTasks: HomeworkTask[]) => HomeworkTask[]
  saveTasks: (sessionId: string, tasks: HomeworkTask[]) => void
  isTaskCompleted: (sessionId: string, studentId: string, taskId: string) => boolean
  setTaskCompleted: (
    sessionId: string,
    studentId: string,
    taskId: string,
    completed: boolean,
  ) => void
  getSummary: (sessionId: string, studentId: string, tasks: HomeworkTask[]) => {
    completed: number
    total: number
    rate: number
    allDone: boolean
  }
}

const HomeworkContext = createContext<HomeworkContextValue | null>(null)

export function HomeworkProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0)

  const bump = useCallback(() => setVersion((current) => current + 1), [])

  const getTasks = useCallback((sessionId: string, defaultTasks: HomeworkTask[]) => {
    return readStoredTasks(sessionId) ?? defaultTasks
  }, [])

  const saveTasks = useCallback(
    (sessionId: string, tasks: HomeworkTask[]) => {
      writeStoredTasks(sessionId, tasks)
      bump()
    },
    [bump],
  )

  const isTaskCompleted = useCallback(
    (sessionId: string, studentId: string, taskId: string) => {
      void version
      return readTaskCompletion(sessionId, studentId, taskId)
    },
    [version],
  )

  const setTaskCompleted = useCallback(
    (sessionId: string, studentId: string, taskId: string, completed: boolean) => {
      writeTaskCompletion(sessionId, studentId, taskId, completed)
      bump()
    },
    [bump],
  )

  const getSummary = useCallback(
    (sessionId: string, studentId: string, tasks: HomeworkTask[]) => {
      void version
      return getCompletionSummary(sessionId, studentId, tasks)
    },
    [version],
  )

  const value = useMemo(
    () => ({
      version,
      getTasks,
      saveTasks,
      isTaskCompleted,
      setTaskCompleted,
      getSummary,
    }),
    [version, getTasks, saveTasks, isTaskCompleted, setTaskCompleted, getSummary],
  )

  return <HomeworkContext.Provider value={value}>{children}</HomeworkContext.Provider>
}

export function useHomework() {
  const context = useContext(HomeworkContext)
  if (!context) {
    throw new Error('useHomework must be used within HomeworkProvider')
  }
  return context
}
