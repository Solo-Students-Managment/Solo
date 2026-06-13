import type { AttendanceStatus } from '@/types'
import { Badge } from '@/components/ui/badge'

const labels: Record<AttendanceStatus, string> = {
  present: 'حاضر',
  absent: 'غایب',
  late: 'تأخیر',
}

const variants: Record<AttendanceStatus, 'success' | 'danger' | 'warning'> = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
}

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}
