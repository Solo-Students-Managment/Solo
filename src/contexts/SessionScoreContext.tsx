import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clampSessionScore,
  readStoredSessionScore,
  resolveSessionScore,
  writeStoredSessionScore,
} from '@/lib/sessionScore'

interface SessionScoreContextValue {
  version: number
  getScore: (sessionId: string, defaultScore: number) => number
  setScore: (sessionId: string, score: number) => void
  hasOverride: (sessionId: string) => boolean
}

const SessionScoreContext = createContext<SessionScoreContextValue | null>(null)

export function SessionScoreProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0)

  const bump = useCallback(() => setVersion((current) => current + 1), [])

  const getScore = useCallback((sessionId: string, defaultScore: number) => {
    void version
    return resolveSessionScore(sessionId, defaultScore)
  }, [version])

  const setScore = useCallback(
    (sessionId: string, score: number) => {
      writeStoredSessionScore(sessionId, clampSessionScore(score))
      bump()
    },
    [bump],
  )

  const hasOverride = useCallback(
    (sessionId: string) => {
      void version
      return readStoredSessionScore(sessionId) !== null
    },
    [version],
  )

  const value = useMemo(
    () => ({ version, getScore, setScore, hasOverride }),
    [version, getScore, setScore, hasOverride],
  )

  return <SessionScoreContext.Provider value={value}>{children}</SessionScoreContext.Provider>
}

export function useSessionScore() {
  const context = useContext(SessionScoreContext)
  if (!context) {
    throw new Error('useSessionScore must be used within SessionScoreProvider')
  }
  return context
}

export function useSessionFinalScore(sessionId: string, defaultScore: number) {
  const { getScore } = useSessionScore()
  return getScore(sessionId, defaultScore)
}
