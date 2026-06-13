import type { RevenueRecord, RevenueType, RevenueStatus } from '@/types'
import { computeRevenueSummary, createRevenueId, seedRevenue } from '@/mocks/seedRevenue'

const REVENUE_KEY = 'revenue-records'
const DELETED_REVENUE_KEY = 'deleted-revenue-ids'

function readJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeJson<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value))
}

function readIdSet(key: string) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set<string>()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set<string>()
  }
}

function writeIdSet(key: string, ids: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...ids]))
}

export function getAllRevenueRecords() {
  const deleted = readIdSet(DELETED_REVENUE_KEY)
  const stored = readJson<RevenueRecord>(REVENUE_KEY)
  const storedIds = new Set(stored.map((item) => item.id))
  const seed = seedRevenue.filter((item) => !deleted.has(item.id) && !storedIds.has(item.id))
  return [...stored.filter((item) => !deleted.has(item.id)), ...seed].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

export function getRevenueSummary() {
  return computeRevenueSummary(getAllRevenueRecords())
}

export interface CreateRevenueInput {
  studentId: string
  parentId: string
  amount: number
  type: RevenueType
  status: RevenueStatus
  date: string
  description: string
}

export function createRevenueRecord(input: CreateRevenueInput) {
  const record: RevenueRecord = { id: createRevenueId(), ...input }
  const stored = readJson<RevenueRecord>(REVENUE_KEY)
  stored.unshift(record)
  writeJson(REVENUE_KEY, stored)
  return record
}

export function updateRevenueRecord(id: string, patch: Partial<CreateRevenueInput>) {
  const stored = readJson<RevenueRecord>(REVENUE_KEY)
  const index = stored.findIndex((item) => item.id === id)
  if (index >= 0) {
    stored[index] = { ...stored[index], ...patch }
    writeJson(REVENUE_KEY, stored)
    return stored[index]
  }
  throw new Error('revenue_not_found')
}

export function deleteRevenueRecord(id: string) {
  const stored = readJson<RevenueRecord>(REVENUE_KEY)
  const next = stored.filter((item) => item.id !== id)
  if (next.length !== stored.length) {
    writeJson(REVENUE_KEY, next)
    return
  }
  const deleted = readIdSet(DELETED_REVENUE_KEY)
  deleted.add(id)
  writeIdSet(DELETED_REVENUE_KEY, deleted)
}

export const REVENUE_TYPES: { value: RevenueType; label: string }[] = [
  { value: 'tuition', label: 'شهریه' },
  { value: 'exam', label: 'آزمون' },
  { value: 'material', label: 'لوازم آموزشی' },
  { value: 'other', label: 'سایر' },
]

export const REVENUE_STATUSES: { value: RevenueStatus; label: string }[] = [
  { value: 'paid', label: 'پرداخت شده' },
  { value: 'pending', label: 'در انتظار' },
  { value: 'overdue', label: 'معوق' },
]
