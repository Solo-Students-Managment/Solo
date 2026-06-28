import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Ticket, TicketStatus } from '@/types';

import { useTickets } from '@/app/providers/TicketContext';
import { useStudents } from '@/app/providers/StudentContext';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '@/mocks/seedTickets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatPersianDateTime } from '@/lib/formatters';
import { getUserById } from '@/lib/studentStore';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/providers/AuthContext';

const statusVariant: Record<TicketStatus, 'warning' | 'secondary' | 'success' | 'outline'> = {
  open: 'warning',
  in_progress: 'secondary',
  resolved: 'success',
  closed: 'outline',
};

export function TicketsPage() {
  const { user } = useAuth();
  const { tickets, getComments, createTicket, updateStatus, addComment } = useTickets();
  const { getStudentsByTeacherId } = useStudents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [comment, setComment] = useState('');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    studentId: '',
  });

  const visibleTickets = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return tickets;
    return tickets.filter((ticket) => ticket.createdById === user.id);
  }, [user, tickets]);

  const activeTicket = visibleTickets.find(
    (ticket) => ticket.id === (selectedId ?? visibleTickets[0]?.id)
  );
  const comments = activeTicket ? getComments(activeTicket.id) : [];
  const teacherStudents = user?.role === 'teacher' ? getStudentsByTeacherId(user.id) : [];

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    try {
      const ticket = createTicket({
        title: newTicket.title,
        description: newTicket.description,
        priority: newTicket.priority,
        createdById: user.id,
        createdByRole: user.role === 'admin' ? 'admin' : 'teacher',
        studentId: newTicket.studentId || undefined,
      });
      setSelectedId(ticket.id);
      setShowCreate(false);
      setNewTicket({
        title: '',
        description: '',
        priority: 'medium',
        studentId: '',
      });
      toast.success('تیکت ایجاد شد');
    } catch {
      toast.error('خطا در ایجاد تیکت');
    }
  };

  const handleComment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !activeTicket || !comment.trim()) return;
    addComment({
      ticketId: activeTicket.id,
      authorId: user.id,
      authorRole: user.role,
      body: comment,
    });
    setComment('');
    toast.success('پاسخ ثبت شد');
  };

  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return <p className="text-muted-foreground">دسترسی مجاز نیست.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">تیکت‌ها</h2>
          <p className="text-muted-foreground text-sm">
            {user.role === 'admin' ? 'مدیریت درخواست‌های پشتیبانی' : 'ارسال درخواست به مدیریت'}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          تیکت جدید
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">تیکت جدید</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>عنوان</Label>
                <Input
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>توضیحات</Label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>اولویت</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(v) =>
                      setNewTicket({
                        ...newTicket,
                        priority: v as typeof newTicket.priority,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKET_PRIORITIES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {user.role === 'teacher' && (
                  <div className="space-y-2">
                    <Label>زبان‌آموز (اختیاری)</Label>
                    <Select
                      value={newTicket.studentId}
                      onValueChange={(v) => setNewTicket({ ...newTicket, studentId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherStudents.map((student) => (
                          <SelectItem key={student.userId} value={student.userId}>
                            {getUserById(student.userId)?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit">ثبت تیکت</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-2">
          {visibleTickets.map((ticket) => (
            <TicketListItem
              key={ticket.id}
              ticket={ticket}
              active={activeTicket?.id === ticket.id}
              onSelect={() => setSelectedId(ticket.id)}
            />
          ))}
          {visibleTickets.length === 0 && (
            <p className="text-muted-foreground rounded-xl border p-6 text-center text-sm">
              تیکتی وجود ندارد
            </p>
          )}
        </div>

        {activeTicket ? (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{activeTicket.title}</CardTitle>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {formatPersianDateTime(activeTicket.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusVariant[activeTicket.status]}>
                    {TICKET_STATUSES.find((s) => s.value === activeTicket.status)?.label}
                  </Badge>
                  <Badge variant="outline">
                    {TICKET_PRIORITIES.find((p) => p.value === activeTicket.priority)?.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{activeTicket.description}</p>

              {user.role === 'admin' && (
                <div className="flex flex-wrap gap-2">
                  {TICKET_STATUSES.map((item) => (
                    <Button
                      key={item.value}
                      size="sm"
                      variant={activeTicket.status === item.value ? 'default' : 'outline'}
                      onClick={() => updateStatus(activeTicket.id, item.value, user.id)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              )}

              <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-medium">گفتگو</p>
                {comments.map((item) => (
                  <div key={item.id} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground mb-1 text-xs">
                      {getUserById(item.authorId)?.name} — {formatPersianDateTime(item.createdAt)}
                    </p>
                    <p className="text-sm">{item.body}</p>
                  </div>
                ))}
                <form onSubmit={handleComment} className="flex gap-2">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="پاسخ خود را بنویسید..."
                    rows={2}
                    className="resize-none"
                  />
                  <Button type="submit" className="self-end">
                    ارسال
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-muted-foreground flex min-h-[300px] items-center justify-center rounded-xl border text-sm">
            تیکتی انتخاب نشده
          </div>
        )}
      </div>
    </div>
  );
}

function TicketListItem({
  ticket,
  active,
  onSelect,
}: {
  ticket: Ticket;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'bg-card hover:bg-accent/50 w-full rounded-xl border p-4 text-start transition-colors',
        active && 'border-primary bg-accent/40'
      )}
    >
      <p className="font-medium">{ticket.title}</p>
      <div className="mt-2 flex gap-2">
        <Badge variant={statusVariant[ticket.status]} className="text-xs">
          {TICKET_STATUSES.find((s) => s.value === ticket.status)?.label}
        </Badge>
      </div>
    </button>
  );
}
