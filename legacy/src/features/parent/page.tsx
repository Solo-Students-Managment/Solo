import { AlertCircle, Award, CalendarCheck, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { useSessionApproval } from '@/app/providers/SessionApprovalContext';
import { useChat } from '@/app/providers/ChatContext';
import { getAttendanceRate, useMockData, useStudentName } from '@/hooks/useMockData';
import { ProgressChart } from '@/features/shared/components/ProgressChart';
import { SessionCard } from '@/features/shared/components/SessionCard';
import { StatCard } from '@/features/shared/components/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatPercent, formatScore } from '@/lib/formatters';
import { useAuth } from '@/app/providers/AuthContext';

export function ParentHomePage() {
  const { user } = useAuth();
  const { currentStudent, parentChildren, sessions } = useMockData();
  const { isConfirmed, approveSession } = useSessionApproval();
  const { getConversationsForParent, getLastMessage } = useChat();
  const childName = useStudentName(currentStudent?.userId ?? '');

  const conversations = user ? getConversationsForParent(user.id) : [];
  const unreadHint = conversations.filter((conversation) => {
    const lastMessage = getLastMessage(conversation.id);
    return lastMessage?.senderRole === 'teacher';
  }).length;

  if (!user || !currentStudent) {
    return <p className="text-muted-foreground">اطلاعات فرزند یافت نشد.</p>;
  }

  const attendanceRate = getAttendanceRate(currentStudent.attendanceStats);
  const latestSession = sessions[0];
  const unconfirmedCount = sessions.filter(
    (session) => !isConfirmed(session.id, session.parentConfirmed)
  ).length;

  const handleConfirmLatest = () => {
    if (!latestSession) return;
    approveSession(latestSession.id, user.id);
    toast.success('گزارش جلسه با موفقیت تأیید شد');
  };

  const latestConfirmed = latestSession
    ? isConfirmed(latestSession.id, latestSession.parentConfirmed)
    : true;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>گزارش {childName}</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                {parentChildren.length > 1
                  ? `${formatNumber(parentChildren.length)} فرزند`
                  : 'نمای کلی پیشرفت تحصیلی'}
              </p>
            </div>
            {unconfirmedCount > 0 && (
              <Badge variant="warning">
                {formatNumber(unconfirmedCount)} گزارش در انتظار تأیید
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-sm">سطح</p>
            <p className="text-lg font-semibold">{currentStudent.level}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">میانگین نمرات</p>
            <p className="text-lg font-semibold">{formatScore(currentStudent.averageScore)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">نرخ حضور</p>
            <p className="text-lg font-semibold">{formatPercent(attendanceRate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">جلسات برگزار شده</p>
            <p className="text-lg font-semibold">
              {formatNumber(currentStudent.sessionsCompleted)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="حضور"
          value={formatNumber(currentStudent.attendanceStats.present)}
          icon={<CalendarCheck className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          title="غیبت"
          value={formatNumber(currentStudent.attendanceStats.absent)}
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
        />
        <StatCard
          title="میانگین نمرات"
          value={formatScore(currentStudent.averageScore)}
          icon={<Award className="text-primary h-4 w-4" />}
        />
        <StatCard
          title="پیام‌های مدرس"
          value={formatNumber(unreadHint)}
          icon={<MessageSquare className="text-primary h-4 w-4" />}
        />
      </div>

      {latestSession && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">آخرین ارزیابی مدرس</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">نقاط قوت</p>
              <div className="flex flex-wrap gap-2">
                {latestSession.teacherEvaluation.strengths.map((item) => (
                  <Badge key={item} variant="success">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">نقاط ضعف</p>
              <div className="flex flex-wrap gap-2">
                {latestSession.teacherEvaluation.weaknesses.map((item) => (
                  <Badge key={item} variant="danger">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {!latestConfirmed && (
                <Button onClick={handleConfirmLatest}>تأیید مشاهده گزارش</Button>
              )}
              <Button variant="outline" asChild>
                <Link to={`/dashboard/sessions/${latestSession.id}`}>مشاهده گزارش کامل</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ProgressChart sessions={sessions} title="پیشرفت ماهانه" />

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">جلسات اخیر</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/messages">رفتن به پیام‌ها</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.slice(0, 4).map((session) => (
            <SessionCard key={session.id} session={session} showConfirmation />
          ))}
        </div>
      </div>
    </div>
  );
}
