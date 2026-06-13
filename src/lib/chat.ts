import type { ChatConversation, ChatMessage, StudentProfile } from '@/types'
import { createConversationId, seedConversations, seedMessages } from '@/mocks/seedChat'
import { getStudentByUserId } from '@/lib/studentStore'

const CONVERSATIONS_KEY = 'chat-conversations'
const MESSAGES_KEY = 'chat-messages'

function readJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeJson<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getStoredConversations() {
  return readJson<ChatConversation>(CONVERSATIONS_KEY)
}

export function getStoredMessages() {
  return readJson<ChatMessage>(MESSAGES_KEY)
}

function mergeConversations(stored: ChatConversation[]) {
  const storedIds = new Set(stored.map((item) => item.id))
  const seed = seedConversations.filter((item) => !storedIds.has(item.id))
  return [...stored, ...seed].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

function mergeMessages(stored: ChatMessage[]) {
  const storedIds = new Set(stored.map((item) => item.id))
  const seed = seedMessages.filter((item) => !storedIds.has(item.id))
  return [...stored, ...seed]
}

export function getAllConversations() {
  return mergeConversations(getStoredConversations())
}

export function getAllMessages() {
  return mergeMessages(getStoredMessages())
}

export function getConversationById(conversationId: string) {
  const existing = getAllConversations().find((item) => item.id === conversationId)
  if (existing) return existing

  const studentId = conversationId.startsWith('conv-')
    ? conversationId.slice('conv-'.length)
    : null
  if (!studentId) return undefined

  const student = getStudentByUserId(studentId)
  if (!student) return undefined

  return {
    id: conversationId,
    parentId: student.parentId,
    teacherId: student.teacherId,
    studentId: student.userId,
    updatedAt: new Date(0).toISOString(),
  }
}

export function getMessagesForConversation(conversationId: string) {
  return getAllMessages()
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
}

export function getConversationsForParent(parentId: string, children: StudentProfile[]) {
  const conversations = getAllConversations()
  return children
    .map((child) => {
      const conversationId = createConversationId(child.userId)
      const existing = conversations.find((item) => item.id === conversationId)
      if (existing) return existing
      return {
        id: conversationId,
        parentId,
        teacherId: child.teacherId,
        studentId: child.userId,
        updatedAt: new Date(0).toISOString(),
      }
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getConversationsForTeacher(teacherId: string, students: StudentProfile[]) {
  const conversations = getAllConversations()
  return students
    .map((student) => {
      const conversationId = createConversationId(student.userId)
      const existing = conversations.find((item) => item.id === conversationId)
      if (existing) return existing
      return {
        id: conversationId,
        parentId: student.parentId,
        teacherId,
        studentId: student.userId,
        updatedAt: new Date(0).toISOString(),
      }
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function createMessageId() {
  return `chat-msg-${crypto.randomUUID()}`
}

export interface SendChatMessageInput {
  conversationId: string
  parentId: string
  teacherId: string
  studentId: string
  senderId: string
  senderRole: 'parent' | 'teacher'
  body: string
}

export function sendChatMessage(input: SendChatMessageInput) {
  const trimmed = input.body.trim()
  if (!trimmed) {
    throw new Error('empty_message')
  }

  const sentAt = new Date().toISOString()
  const message: ChatMessage = {
    id: createMessageId(),
    conversationId: input.conversationId,
    senderId: input.senderId,
    senderRole: input.senderRole,
    body: trimmed,
    sentAt,
  }

  const storedConversations = getStoredConversations()
  const storedMessages = getStoredMessages()
  const conversationIndex = storedConversations.findIndex(
    (item) => item.id === input.conversationId,
  )

  const conversation: ChatConversation = {
    id: input.conversationId,
    parentId: input.parentId,
    teacherId: input.teacherId,
    studentId: input.studentId,
    updatedAt: sentAt,
  }

  if (conversationIndex >= 0) {
    storedConversations[conversationIndex] = conversation
  } else {
    storedConversations.unshift(conversation)
  }

  storedMessages.push(message)

  writeJson(CONVERSATIONS_KEY, storedConversations)
  writeJson(MESSAGES_KEY, storedMessages)

  return message
}

export function getLastMessage(conversationId: string) {
  const messages = getMessagesForConversation(conversationId)
  return messages.at(-1) ?? null
}
