import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const chatRoomSchema = z.object({
  id: opaqueIdSchema,
  name: z.string().min(1),
  scope: z.enum(["direct", "group", "class", "subject", "organization"]),
  visibility: z.enum(["private", "organization"]),
  memberCount: z.number().int().positive(),
});
export type ChatRoom = z.infer<typeof chatRoomSchema>;
export const chatRoomsCollectionSchema = collectionSchema(chatRoomSchema);

export const chatMessageSchema = z.object({
  id: opaqueIdSchema,
  roomId: opaqueIdSchema,
  authorLabel: z.string().min(1),
  body: z.string().min(1),
  createdAt: z.string().min(1),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export const chatMessagesCollectionSchema = collectionSchema(chatMessageSchema);

export type ChatClient = {
  listRooms(): Promise<z.infer<typeof chatRoomsCollectionSchema>>;
  listMessages(
    roomId: string,
  ): Promise<z.infer<typeof chatMessagesCollectionSchema>>;
  createRoom(input: {
    name: string;
    scope: ChatRoom["scope"];
  }): Promise<ChatRoom>;
  sendMessage(roomId: string, body: string): Promise<ChatMessage>;
};

const rooms: ChatRoom[] = [];
const messages = new Map<string, ChatMessage[]>();

export function createHttpChatClient(): ChatClient {
  return {
    async listRooms() {
      return apiRequest("/chat/rooms", {
        parse: (data) => chatRoomsCollectionSchema.parse(data),
      });
    },
    async listMessages(roomId) {
      return apiRequest(`/chat/rooms/${encodeURIComponent(roomId)}/messages`, {
        parse: (data) => chatMessagesCollectionSchema.parse(data),
      });
    },
    async createRoom(input) {
      return apiRequest("/chat/rooms", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => chatRoomSchema.parse(data),
      });
    },
    async sendMessage(roomId, body) {
      return apiRequest(`/chat/rooms/${encodeURIComponent(roomId)}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
        parse: (data) => chatMessageSchema.parse(data),
      });
    },
  };
}

export function createMockChatClient(): ChatClient {
  return {
    async listRooms() {
      return {
        data: [...rooms],
        meta: {
          page: 1,
          pageSize: Math.max(rooms.length, 1),
          totalItems: rooms.length,
          totalPages: 1,
        },
      };
    },
    async listMessages(roomId) {
      const data = messages.get(roomId) ?? [];
      return {
        data,
        meta: {
          page: 1,
          pageSize: Math.max(data.length, 1),
          totalItems: data.length,
          totalPages: 1,
        },
      };
    },
    async createRoom(input) {
      const item = chatRoomSchema.parse({
        id: opaqueIdSchema.parse(
          `room_${Math.random().toString(36).slice(2, 10)}`,
        ),
        name: input.name.trim(),
        scope: input.scope,
        visibility: input.scope === "organization" ? "organization" : "private",
        memberCount: 1,
      });
      rooms.unshift(item);
      messages.set(String(item.id), []);
      return item;
    },
    async sendMessage(roomId, body) {
      const item = chatMessageSchema.parse({
        id: opaqueIdSchema.parse(
          `cmsg_${Math.random().toString(36).slice(2, 10)}`,
        ),
        roomId: opaqueIdSchema.parse(roomId),
        authorLabel: "You",
        body: body.trim(),
        createdAt: new Date().toISOString(),
      });
      messages.set(roomId, [...(messages.get(roomId) ?? []), item]);
      return item;
    },
  };
}

let client: ChatClient = createMockChatClient();
export function getChatClient() {
  return client;
}
export function setChatClient(next: ChatClient) {
  client = next;
}
