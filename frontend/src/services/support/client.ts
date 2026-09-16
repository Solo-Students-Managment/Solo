import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const supportTicketSchema = z.object({
  id: opaqueIdSchema,
  subject: z.string().min(1),
  status: z.enum(["open", "in_progress", "resolved"]),
  createdAt: z.string().min(1),
});
export type SupportTicket = z.infer<typeof supportTicketSchema>;

export const supportModeSchema = z.object({
  active: z.boolean(),
  expiresAt: z.string().nullable(),
  targetOrgId: opaqueIdSchema.nullable(),
});
export type SupportMode = z.infer<typeof supportModeSchema>;

export type SupportClient = {
  listTickets(): Promise<SupportTicket[]>;
  openTicket(input: { subject: string }): Promise<SupportTicket>;
  getSupportMode(): Promise<SupportMode>;
  enterSupportMode(input: {
    targetOrgId: string;
    minutes: number;
  }): Promise<SupportMode>;
  exitSupportMode(): Promise<SupportMode>;
};

const tickets: SupportTicket[] = [];
let mode: SupportMode = { active: false, expiresAt: null, targetOrgId: null };

export function createHttpSupportClient(): SupportClient {
  return {
    async listTickets() {
      return apiRequest("/admin/support/tickets", {
        parse: (data) => z.array(supportTicketSchema).parse(data),
      });
    },
    async openTicket(input) {
      return apiRequest("/admin/support/tickets", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => supportTicketSchema.parse(data),
      });
    },
    async getSupportMode() {
      return apiRequest("/admin/support/mode", {
        parse: (data) => supportModeSchema.parse(data),
      });
    },
    async enterSupportMode(input) {
      return apiRequest("/admin/support/mode/enter", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (data) => supportModeSchema.parse(data),
      });
    },
    async exitSupportMode() {
      return apiRequest("/admin/support/mode/exit", {
        method: "POST",
        parse: (data) => supportModeSchema.parse(data),
      });
    },
  };
}

export function createMockSupportClient(): SupportClient {
  return {
    async listTickets() {
      return [...tickets];
    },
    async openTicket(input) {
      const row = supportTicketSchema.parse({
        id: `tkt_${Date.now()}`,
        subject: input.subject,
        status: "open",
        createdAt: new Date().toISOString(),
      });
      tickets.unshift(row);
      return row;
    },
    async getSupportMode() {
      if (
        mode.active &&
        mode.expiresAt &&
        new Date(mode.expiresAt).getTime() < Date.now()
      ) {
        mode = { active: false, expiresAt: null, targetOrgId: null };
      }
      return mode;
    },
    async enterSupportMode(input) {
      mode = supportModeSchema.parse({
        active: true,
        expiresAt: new Date(Date.now() + input.minutes * 60_000).toISOString(),
        targetOrgId: input.targetOrgId,
      });
      return mode;
    },
    async exitSupportMode() {
      mode = { active: false, expiresAt: null, targetOrgId: null };
      return mode;
    },
  };
}

let client: SupportClient = createMockSupportClient();
export function getSupportClient() {
  return client;
}
export function setSupportClient(next: SupportClient) {
  client = next;
}
