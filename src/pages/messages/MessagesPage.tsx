import { useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { ChatThread } from '@/components/messages/ChatThread'
import { ConversationList } from '@/components/messages/ConversationList'

export function MessagesPage() {
  const { user } = useAuth()
  const { getConversationsForParent, getConversationsForTeacher } = useChat()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileShowThread, setMobileShowThread] = useState(false)

  const conversations = useMemo(() => {
    if (!user) return []
    if (user.role === 'parent') return getConversationsForParent(user.id)
    if (user.role === 'teacher') return getConversationsForTeacher(user.id)
    return []
  }, [user, getConversationsForParent, getConversationsForTeacher])

  const activeId = selectedId ?? conversations[0]?.id ?? null
  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ?? null

  const handleSelect = (conversationId: string) => {
    setSelectedId(conversationId)
    setMobileShowThread(true)
  }

  if (!user || (user.role !== 'parent' && user.role !== 'teacher')) {
    return <p className="text-muted-foreground">دسترسی به پیام‌ها مجاز نیست.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">پیام‌ها</h2>
        <p className="text-sm text-muted-foreground">
          {user.role === 'teacher'
            ? 'گفتگو با اولیای زبان‌آموزان'
            : 'گفتگو با مدرس فرزند'}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <div className={mobileShowThread ? 'hidden lg:block' : 'block'}>
          <ConversationList
            conversations={conversations}
            selectedId={activeId}
            onSelect={handleSelect}
          />
        </div>

        <div className={mobileShowThread ? 'block' : 'hidden lg:block'}>
          {activeConversation ? (
            <ChatThread
              conversation={activeConversation}
              onBack={mobileShowThread ? () => setMobileShowThread(false) : undefined}
            />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border bg-card p-6 text-sm text-muted-foreground">
              یک گفتگو را انتخاب کنید
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
