import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { RevenueRecord, RevenueSummary, UserRole } from '@/types'
import {
  createRevenueRecord,
  deleteRevenueRecord,
  getAllRevenueRecords,
  getRevenueSummary,
  updateRevenueRecord,
  type CreateRevenueInput,
} from '@/lib/revenue'

interface RevenueContextValue {
  version: number
  records: RevenueRecord[]
  summary: RevenueSummary
  createRecord: (input: CreateRevenueInput) => RevenueRecord
  updateRecord: (id: string, patch: Partial<CreateRevenueInput>) => RevenueRecord
  deleteRecord: (id: string) => void
}

const RevenueContext = createContext<RevenueContextValue | null>(null)

export function RevenueProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((current) => current + 1), [])

  const records = useMemo(() => {
    void version
    return getAllRevenueRecords()
  }, [version])

  const summary = useMemo(() => {
    void version
    return getRevenueSummary()
  }, [version])

  const value = useMemo<RevenueContextValue>(
    () => ({
      version,
      records,
      summary,
      createRecord: (input) => {
        const record = createRevenueRecord(input)
        bump()
        return record
      },
      updateRecord: (id, patch) => {
        const record = updateRevenueRecord(id, patch)
        bump()
        return record
      },
      deleteRecord: (id) => {
        deleteRevenueRecord(id)
        bump()
      },
    }),
    [version, records, summary, bump],
  )

  return <RevenueContext.Provider value={value}>{children}</RevenueContext.Provider>
}

export function useRevenue() {
  const context = useContext(RevenueContext)
  if (!context) {
    throw new Error('useRevenue must be used within RevenueProvider')
  }
  return context
}

export function useRevenueOptional() {
  return useContext(RevenueContext)
}

export function useRevenueForRole(_role: UserRole) {
  return useRevenue()
}
