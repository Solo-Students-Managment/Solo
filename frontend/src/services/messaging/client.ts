import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const messageThreadSchema = z.object({
  id: opaqueIdSchema,
  subjectScope: z.string().min(1),
  participantLabel: z.string().min(1),
  lastPreview: z.string(),
  unreadCount: z.number().int().nonnegative(),
  kind: z.enum(["direct", "broadcast"]),
});
export type MessageThread = z.infer<typeof messageThreadSchema>;
export const messageThreadsCollectionSchema =
  collectionSchema(messageThreadSchema);

export type MessagingClient = {
  listThreads(): Promise<z.infer<typeof messageThreadsCollectionSchema>>;
  sendDirect(input: {
    subjectScope: string;
    participantLabel: string;
    body: string;
  }): Promise<MessageThread>;
  sendBroadcast(input: {
    subjectScope: string;
    body: string;
  }): Promise<MessageThread>;
};

const memory: MessageThread[] = [];

export function createHttpMessagingClient(): MessagingClient {
  return {
    async listThreads() {
      return apiRequest("/messaging/threads", {
        parse: (data) => messageThreadsCollectionSchema.parse(data),
      });
    },
    async sendDirect(input) {
      return apiRequest("/messaging/direct", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => messageThreadSchema.parse(data),
      });
    },
    async sendBroadcast(input) {
      return apiRequest("/messaging/broadcast", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => messageThreadSchema.parse(data),
      });
    },
  };
}

export function createMockMessagingClient(): MessagingClient {
  return {
    async listThreads() {
      return {
        data: [...memory],
        meta: {
          page: 1,
          pageSize: Math.max(memory.length, 1),
          totalItems: memory.length,
          totalPages: 1,
        },
      };
    },
    async sendDirect(input) {
      const item = messageThreadSchema.parse({
        id: opaqueIdSchema.parse(
          `msg_${Math.random().toString(36).slice(2, 10)}`,
        ),
        subjectScope: input.subjectScope.trim(),
        participantLabel: input.participantLabel.trim(),
        lastPreview: input.body.trim().slice(0, 120),
        unreadCount: 0,
        kind: "direct",
      });
      memory.unshift(item);
      return item;
    },
    async sendBroadcast(input) {
      const item = messageThreadSchema.parse({
        id: opaqueIdSchema.parse(
          `msg_${Math.random().toString(36).slice(2, 10)}`,
        ),
        subjectScope: input.subjectScope.trim(),
        participantLabel: "Broadcast",
        lastPreview: input.body.trim().slice(0, 120),
        unreadCount: 0,
        kind: "broadcast",
      });
      memory.unshift(item);
      return item;
    },
  };
}

let client: MessagingClient = createMockMessagingClient();
export function getMessagingClient() {
  return client;
}
export function setMessagingClient(next: MessagingClient) {
  client = next;
}
