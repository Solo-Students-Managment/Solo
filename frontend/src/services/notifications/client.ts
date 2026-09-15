import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const notificationSchema = z.object({
  id: opaqueIdSchema,
  category: z.enum([
    "session",
    "homework",
    "exam",
    "message",
    "payment",
    "school",
    "system",
  ]),
  title: z.string().min(1),
  unread: z.boolean(),
  href: z.string().min(1),
});
export type AppNotification = z.infer<typeof notificationSchema>;
export const notificationsCollectionSchema =
  collectionSchema(notificationSchema);

export const notificationPreferencesSchema = z.object({
  inApp: z.boolean(),
  sms: z.boolean(),
  webPush: z.boolean(),
  quietHoursEnabled: z.boolean(),
});
export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;

export type NotificationsClient = {
  list(): Promise<z.infer<typeof notificationsCollectionSchema>>;
  getPreferences(): Promise<NotificationPreferences>;
  updatePreferences(
    input: NotificationPreferences,
  ): Promise<NotificationPreferences>;
  markRead(id: string): Promise<AppNotification>;
};

let prefs: NotificationPreferences = {
  inApp: true,
  sms: true,
  webPush: false,
  quietHoursEnabled: false,
};
const items: AppNotification[] = [
  {
    id: opaqueIdSchema.parse("ntf_demo1"),
    category: "homework",
    title: "New homework published",
    unread: true,
    href: "/personal/messages",
  },
];

export function createHttpNotificationsClient(): NotificationsClient {
  return {
    async list() {
      return apiRequest("/notifications", {
        parse: (data) => notificationsCollectionSchema.parse(data),
      });
    },
    async getPreferences() {
      return apiRequest("/notifications/preferences", {
        parse: (data) => notificationPreferencesSchema.parse(data),
      });
    },
    async updatePreferences(input) {
      return apiRequest("/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(input),
        parse: (data) => notificationPreferencesSchema.parse(data),
      });
    },
    async markRead(id) {
      return apiRequest(`/notifications/${encodeURIComponent(id)}/read`, {
        method: "POST",
        parse: (data) => notificationSchema.parse(data),
      });
    },
  };
}

export function createMockNotificationsClient(): NotificationsClient {
  return {
    async list() {
      return {
        data: [...items],
        meta: {
          page: 1,
          pageSize: Math.max(items.length, 1),
          totalItems: items.length,
          totalPages: 1,
        },
      };
    },
    async getPreferences() {
      return prefs;
    },
    async updatePreferences(input) {
      prefs = input;
      return prefs;
    },
    async markRead(id) {
      const idx = items.findIndex((n) => String(n.id) === id);
      if (idx < 0) throw new Error("NOT_FOUND");
      items[idx] = { ...items[idx]!, unread: false };
      return items[idx]!;
    },
  };
}

let client: NotificationsClient = createMockNotificationsClient();
export function getNotificationsClient() {
  return client;
}
export function setNotificationsClient(next: NotificationsClient) {
  client = next;
}
