import type { ChatConversation, ChatMessage } from '@/types'
import {
  DEMO_PARENT_ID,
  DEMO_STUDENT_ID,
  DEMO_TEACHER_ID,
} from '@/mocks/seedUsers'

export function createConversationId(studentId: string) {
  return `conv-${studentId}`
}

export const seedConversations: ChatConversation[] = [
  {
    id: createConversationId(DEMO_STUDENT_ID),
    parentId: DEMO_PARENT_ID,
    teacherId: DEMO_TEACHER_ID,
    studentId: DEMO_STUDENT_ID,
    updatedAt: '2025-04-26T14:30:00',
  },
]

export const seedMessages: ChatMessage[] = [
  {
    id: 'chat-msg-1',
    conversationId: createConversationId(DEMO_STUDENT_ID),
    senderId: DEMO_TEACHER_ID,
    senderRole: 'teacher',
    body: 'گزارش جلسه ۲۶ آوریل آماده مشاهده است. لطفاً بررسی و تأیید کنید.',
    sentAt: '2025-04-26T14:30:00',
  },
  {
    id: 'chat-msg-2',
    conversationId: createConversationId(DEMO_STUDENT_ID),
    senderId: DEMO_PARENT_ID,
    senderRole: 'parent',
    body: 'سلام، آیا برای جلسه بعد تمرین اضافه‌ای پیشنهاد می‌کنید؟',
    sentAt: '2025-04-20T10:15:00',
  },
  {
    id: 'chat-msg-3',
    conversationId: createConversationId(DEMO_STUDENT_ID),
    senderId: DEMO_TEACHER_ID,
    senderRole: 'teacher',
    body: 'بله، تمرین listening از فصل ۶ را انجام دهید.',
    sentAt: '2025-04-20T16:45:00',
  },
  {
    id: 'chat-msg-4',
    conversationId: createConversationId(DEMO_STUDENT_ID),
    senderId: DEMO_TEACHER_ID,
    senderRole: 'teacher',
    body: 'علی در جلسه ۵ آوریل غایب بود. لطفاً علت غیبت را اطلاع دهید.',
    sentAt: '2025-04-06T09:00:00',
  },
  {
    id: 'chat-msg-5',
    conversationId: createConversationId(DEMO_STUDENT_ID),
    senderId: DEMO_PARENT_ID,
    senderRole: 'parent',
    body: 'متأسفانه به دلیل بیماری غایب بود. جلسه جبرانی درخواست می‌کنیم.',
    sentAt: '2025-04-06T11:30:00',
  },
  {
    id: 'chat-msg-6',
    conversationId: createConversationId(DEMO_STUDENT_ID),
    senderId: DEMO_PARENT_ID,
    senderRole: 'parent',
    body: 'پیشرفت listening عالی بود. ممنون از گزارش دقیق.',
    sentAt: '2025-03-23T18:20:00',
  },
  {
    id: 'chat-msg-7',
    conversationId: createConversationId(DEMO_STUDENT_ID),
    senderId: DEMO_TEACHER_ID,
    senderRole: 'teacher',
    body: 'گزارش اولین جلسه ثبت شد. علی عملکرد خوبی داشت.',
    sentAt: '2025-03-01T15:00:00',
  },
]
