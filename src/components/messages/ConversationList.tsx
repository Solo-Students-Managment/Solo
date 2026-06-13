import type { ChatConversation } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { formatPersianDateTime } from '@/lib/formatters'
import { getUserById } from '@/lib/studentStore'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ConversationListProps {
  conversations: ChatConversation[]
  selectedId: string | null
  onSelect: (conversationId: string) => void
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const { user } = useAuth()
  const { getLastMessage } = useChat()

  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
        گفتگویی یافت نشد.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const parentName = getUserById(conversation.parentId)?.name ?? 'ولی'
        const teacherName = getUserById(conversation.teacherId)?.name ?? 'مدرس'
        const studentName = getUserById(conversation.studentId)?.name ?? 'زبان‌آموز'
        const lastMessage = getLastMessage(conversation.id)
        const title =
          user?.role === 'teacher'
            ? `${parentName} — ${studentName}`
            : `${teacherName} — ${studentName}`

        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={cn(
              'w-full rounded-xl border bg-card p-4 text-start transition-colors hover:bg-accent/50',
              selectedId === conversation.id && 'border-primary bg-accent/40',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {lastMessage?.body ?? 'بدون پیام'}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {user?.role === 'teacher' ? 'ولی' : 'مدرس'}
              </Badge>
            </div>
            {lastMessage && (
              <p className="mt-2 text-xs text-muted-foreground">
                {formatPersianDateTime(lastMessage.sentAt)}
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}
