import { z } from "zod";
export const createRoomSchema = z.object({
  name: z.string().trim().min(1, "chat.validation.name"),
  scope: z.enum(["direct", "group", "class", "subject", "organization"]),
});
export const sendChatMessageSchema = z.object({
  body: z.string().trim().min(1, "chat.validation.body"),
});
export type CreateRoomValues = z.infer<typeof createRoomSchema>;
export type SendChatMessageValues = z.infer<typeof sendChatMessageSchema>;
