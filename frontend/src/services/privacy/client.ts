import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const privacyRequestSchema = z.object({
  id: opaqueIdSchema,
  type: z.enum(["export", "delete"]),
  status: z.enum(["submitted", "processing", "completed", "rejected"]),
  subjectEmail: z.string().email(),
  createdAt: z.string().min(1),
});
export type PrivacyRequest = z.infer<typeof privacyRequestSchema>;

export type PrivacyClient = {
  list(): Promise<PrivacyRequest[]>;
  submit(input: {
    type: "export" | "delete";
    subjectEmail: string;
  }): Promise<PrivacyRequest>;
  complete(id: string): Promise<PrivacyRequest>;
};

const memory: PrivacyRequest[] = [];

export function createHttpPrivacyClient(): PrivacyClient {
  return {
    async list() {
      return apiRequest("/admin/privacy/requests", {
        parse: (d) => z.array(privacyRequestSchema).parse(d),
      });
    },
    async submit(input) {
      return apiRequest("/admin/privacy/requests", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (d) => privacyRequestSchema.parse(d),
      });
    },
    async complete(id) {
      return apiRequest(
        `/admin/privacy/requests/${encodeURIComponent(id)}/complete`,
        { method: "POST", parse: (d) => privacyRequestSchema.parse(d) },
      );
    },
  };
}

export function createMockPrivacyClient(): PrivacyClient {
  return {
    async list() {
      return [...memory];
    },
    async submit(input) {
      const row = privacyRequestSchema.parse({
        id: `prv_${Date.now()}`,
        type: input.type,
        status: "submitted",
        subjectEmail: input.subjectEmail,
        createdAt: new Date().toISOString(),
      });
      memory.unshift(row);
      return row;
    },
    async complete(id) {
      const idx = memory.findIndex((r) => r.id === id);
      if (idx < 0) throw new Error("not_found");
      memory[idx] = privacyRequestSchema.parse({
        ...memory[idx],
        status: "completed",
      });
      return memory[idx]!;
    },
  };
}

let client: PrivacyClient = createMockPrivacyClient();
export function getPrivacyClient() {
  return client;
}
export function setPrivacyClient(next: PrivacyClient) {
  client = next;
}
