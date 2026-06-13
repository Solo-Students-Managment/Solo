import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  approveSession as persistApproval,
  readStoredApproval,
  resolveParentConfirmed,
  type SessionApproval,
} from '@/lib/sessionApproval'

interface SessionApprovalContextValue {
  version: number
  isConfirmed: (sessionId: string, defaultConfirmed?: boolean) => boolean
  getApproval: (sessionId: string) => SessionApproval | null
  approveSession: (sessionId: string, parentId: string) => void
}

const SessionApprovalContext = createContext<SessionApprovalContextValue | null>(null)

export function SessionApprovalProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0)

  const bump = useCallback(() => setVersion((current) => current + 1), [])

  const isConfirmed = useCallback(
    (sessionId: string, defaultConfirmed?: boolean) => {
      void version
      return resolveParentConfirmed(sessionId, defaultConfirmed)
    },
    [version],
  )

  const getApproval = useCallback(
    (sessionId: string) => {
      void version
      return readStoredApproval(sessionId)
    },
    [version],
  )

  const approveSession = useCallback(
    (sessionId: string, parentId: string) => {
      persistApproval(sessionId, parentId)
      bump()
    },
    [bump],
  )

  const value = useMemo(
    () => ({ version, isConfirmed, getApproval, approveSession }),
    [version, isConfirmed, getApproval, approveSession],
  )

  return (
    <SessionApprovalContext.Provider value={value}>{children}</SessionApprovalContext.Provider>
  )
}

export function useSessionApproval() {
  const context = useContext(SessionApprovalContext)
  if (!context) {
    throw new Error('useSessionApproval must be used within SessionApprovalProvider')
  }
  return context
}

export function useSessionParentConfirmed(sessionId: string, defaultConfirmed?: boolean) {
  const { isConfirmed } = useSessionApproval()
  return isConfirmed(sessionId, defaultConfirmed)
}
