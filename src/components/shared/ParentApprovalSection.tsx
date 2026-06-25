import { CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { useSessionApproval } from '@/contexts/SessionApprovalContext';
import { formatPersianDateTime } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface ParentApprovalSectionProps {
  sessionId: string;
  defaultConfirmed?: boolean;
}

export function ParentApprovalSection({ sessionId, defaultConfirmed }: ParentApprovalSectionProps) {
  const { user } = useAuth();
  const { isConfirmed, getApproval, approveSession } = useSessionApproval();

  if (!user || user.role !== 'parent') return null;

  const confirmed = isConfirmed(sessionId, defaultConfirmed);
  const approval = getApproval(sessionId);

  const handleApprove = () => {
    approveSession(sessionId, user.id);
    toast.success('گزارش جلسه با موفقیت تأیید شد');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">تأیید گزارش جلسه</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {confirmed ? (
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="size-3.5" />
              تأیید شده
            </Badge>
            {approval && (
              <p className="text-muted-foreground text-sm">
                تاریخ تأیید: {formatPersianDateTime(approval.confirmedAt)}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="size-4 shrink-0" />
              <p>لطفاً پس از مطالعه گزارش کامل جلسه، مشاهده و تأیید خود را ثبت کنید.</p>
            </div>
            <Button onClick={handleApprove}>تأیید مشاهده گزارش</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
