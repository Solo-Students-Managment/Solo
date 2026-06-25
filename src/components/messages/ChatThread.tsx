import { useEffect, useRef } from 'react';
import type { ChatConversation, ChatMessage } from '@/types';

import { useChat } from '@/contexts/ChatContext';
import { formatPersianDateTime } from '@/lib/formatters';
import { getUserById } from '@/lib/studentStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface ChatThreadProps {
  conversation: ChatConversation;
  onBack?: () => void;
}

export function ChatThread({ conversation, onBack }: ChatThreadProps) {
  const { user } = useAuth();
  const { getMessages, sendMessage } = useChat();
  const messages = getMessages(conversation.id);
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const parentName = getUserById(conversation.parentId)?.name ?? 'ولی';
  const teacherName = getUserById(conversation.teacherId)?.name ?? 'مدرس';
  const studentName = getUserById(conversation.studentId)?.name ?? 'زبان‌آموز';

  const headerTitle =
    user?.role === 'teacher' ? `${parentName} — ${studentName}` : `${teacherName} — ${studentName}`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, conversation.id]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || (user.role !== 'parent' && user.role !== 'teacher')) return;

    const formData = new FormData(event.currentTarget);
    const body = String(formData.get('body') ?? '');

    try {
      sendMessage({
        conversationId: conversation.id,
        parentId: conversation.parentId,
        teacherId: conversation.teacherId,
        studentId: conversation.studentId,
        senderId: user.id,
        senderRole: user.role,
        body,
      });
      formRef.current?.reset();
    } catch {
      // empty message — ignore
    }
  };

  return (
    <div className="bg-card flex h-full min-h-[420px] flex-col rounded-xl border">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        {onBack && (
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            بازگشت
          </Button>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{headerTitle}</p>
          <p className="text-muted-foreground text-xs">گفتگوی ولی و مدرس</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            هنوز پیامی رد و بدل نشده. اولین پیام را ارسال کنید.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === user?.id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            name="body"
            placeholder="پیام خود را بنویسید..."
            rows={2}
            className="min-h-[72px] resize-none"
            required
          />
          <Button type="submit" className="self-end">
            ارسال
          </Button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  const senderName = getUserById(message.senderId)?.name ?? 'کاربر';

  return (
    <div className={cn('flex', isOwn ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <p className="mb-1 text-xs opacity-80">{senderName}</p>
        <p className="text-sm whitespace-pre-wrap">{message.body}</p>
        <p className="mt-2 text-[11px] opacity-70">{formatPersianDateTime(message.sentAt)}</p>
      </div>
    </div>
  );
}
