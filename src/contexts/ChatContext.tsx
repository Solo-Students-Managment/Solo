import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ChatConversation, ChatMessage } from '@/types'
import {
  getAllConversations,
  getAllMessages,
  getConversationById,
  getConversationsForParent,
  getConversationsForTeacher,
  getLastMessage,
  getMessagesForConversation,
  sendChatMessage,
  type SendChatMessageInput,
} from '@/lib/chat'
import { getStudentsByParentId, getStudentsByTeacherId } from '@/lib/studentStore'

interface ChatContextValue {
  version: number
  conversations: ChatConversation[]
  messages: ChatMessage[]
  getConversation: (conversationId: string) => ChatConversation | undefined
  getMessages: (conversationId: string) => ChatMessage[]
  getLastMessage: (conversationId: string) => ChatMessage | null
  getConversationsForParent: (parentId: string) => ChatConversation[]
  getConversationsForTeacher: (teacherId: string) => ChatConversation[]
  sendMessage: (input: SendChatMessageInput) => ChatMessage
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0)

  const bump = useCallback(() => setVersion((current) => current + 1), [])

  const conversations = useMemo(() => {
    void version
    return getAllConversations()
  }, [version])

  const messages = useMemo(() => {
    void version
    return getAllMessages()
  }, [version])

  const sendMessage = useCallback(
    (input: SendChatMessageInput) => {
      const message = sendChatMessage(input)
      bump()
      return message
    },
    [bump],
  )

  const value = useMemo<ChatContextValue>(
    () => ({
      version,
      conversations,
      messages,
      getConversation: (conversationId) => getConversationById(conversationId),
      getMessages: (conversationId) => getMessagesForConversation(conversationId),
      getLastMessage: (conversationId) => getLastMessage(conversationId),
      getConversationsForParent: (parentId) =>
        getConversationsForParent(parentId, getStudentsByParentId(parentId)),
      getConversationsForTeacher: (teacherId) =>
        getConversationsForTeacher(teacherId, getStudentsByTeacherId(teacherId)),
      sendMessage,
    }),
    [version, conversations, messages, sendMessage],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
