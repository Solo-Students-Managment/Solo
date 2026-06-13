import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSessionApproval } from '@/contexts/SessionApprovalContext'
import { useMockData, useSession } from '@/hooks/useMockData'
import { ParentApprovalSection } from '@/components/shared/ParentApprovalSection'
import { SessionDetailView } from '@/components/shared/SessionDetailView'
import { Button } from '@/components/ui/button'

export function SessionDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const session = useSession(id)
  const { parentChildren } = useMockData()
  const { isConfirmed } = useSessionApproval()

  if (!session) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">جلسه یافت نشد.</p>
        <Button asChild variant="outline">
          <Link to="/dashboard/sessions">بازگشت به لیست جلسات</Link>
        </Button>
      </div>
    )
  }

  const isParent = user?.role === 'parent'
  const canApprove =
    isParent && parentChildren.some((child) => child.userId === session.studentId)
  const parentConfirmed = isConfirmed(session.id, session.parentConfirmed)

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="ps-0">
        <Link to="/dashboard/sessions">
          <ArrowRight className="h-4 w-4" />
          بازگشت به جلسات
        </Link>
      </Button>
      <SessionDetailView
        session={session}
        readOnly
        showApprovalStatus={user?.role === 'teacher' || user?.role === 'admin'}
        parentConfirmed={parentConfirmed}
      />
      {canApprove && (
        <ParentApprovalSection
          sessionId={session.id}
          defaultConfirmed={session.parentConfirmed}
        />
      )}
    </div>
  )
}
