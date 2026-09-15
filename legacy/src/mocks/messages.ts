import type { ParentMessage } from '@/types';
import { DEMO_PARENT_ID, DEMO_TEACHER_ID } from './users';

export const mockMessages: ParentMessage[] = [
  {
    id: 'msg-1',
    sessionId: 'session-16',
    senderId: DEMO_TEACHER_ID,
    senderName: 'سارا احمدی',
    senderRole: 'teacher',
    message: 'گزارش جلسه ۲۶ آوریل آماده مشاهده است. لطفاً بررسی و تأیید کنید.',
    sentAt: '2025-04-26T14:30:00',
  },
  {
    id: 'msg-2',
    sessionId: 'session-8',
    senderId: DEMO_PARENT_ID,
    senderName: 'مریم رضایی',
    senderRole: 'parent',
    message: 'سلام، آیا برای جلسه بعد تمرین اضافه‌ای پیشنهاد می‌کنید؟',
    reply: 'بله، تمرین listening از فصل ۶ را انجام دهید.',
    sentAt: '2025-04-20T10:15:00',
    repliedAt: '2025-04-20T16:45:00',
  },
  {
    id: 'msg-3',
    sessionId: 'session-6',
    senderId: DEMO_TEACHER_ID,
    senderName: 'سارا احمدی',
    senderRole: 'teacher',
    message: 'علی در جلسه ۵ آوریل غایب بود. لطفاً علت غیبت را اطلاع دهید.',
    reply: 'متأسفانه به دلیل بیماری غایب بود. جلسه جبرانی درخواست می‌کنیم.',
    sentAt: '2025-04-06T09:00:00',
    repliedAt: '2025-04-06T11:30:00',
  },
  {
    id: 'msg-4',
    sessionId: 'session-4',
    senderId: DEMO_PARENT_ID,
    senderName: 'مریم رضایی',
    senderRole: 'parent',
    message: 'پیشرفت listening عالی بود. ممنون از گزارش دقیق.',
    sentAt: '2025-03-23T18:20:00',
  },
  {
    id: 'msg-5',
    sessionId: 'session-1',
    senderId: DEMO_TEACHER_ID,
    senderName: 'سارا احمدی',
    senderRole: 'teacher',
    message: 'گزارش اولین جلسه ثبت شد. علی عملکرد خوبی داشت.',
    sentAt: '2025-03-01T15:00:00',
  },
];

export function getMessagesForParent(parentId: string, studentId: string) {
  const studentSessionIds = mockMessages
    .filter((msg) => msg.sessionId.startsWith('session'))
    .map((msg) => msg.sessionId);

  void parentId;
  void studentId;

  return mockMessages.filter((msg) => studentSessionIds.includes(msg.sessionId));
}

export function getMessagesBySessionId(sessionId: string) {
  return mockMessages.filter((msg) => msg.sessionId === sessionId);
}
