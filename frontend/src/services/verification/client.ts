import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const verificationKindSchema = z.enum([
  "teacher",
  "school",
  "institute",
]);
export const verificationStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);
export const verificationRequestSchema = z.object({
  id: opaqueIdSchema,
  kind: verificationKindSchema,
  displayName: z.string().min(1),
  status: verificationStatusSchema,
  submittedAt: z.string().min(1),
});
export type VerificationRequest = z.infer<typeof verificationRequestSchema>;

export type VerificationClient = {
  list(): Promise<VerificationRequest[]>;
  approve(id: string): Promise<VerificationRequest>;
  reject(id: string): Promise<VerificationRequest>;
};

const memory: VerificationRequest[] = [];

function seed() {
  if (memory.length) return;
  memory.push(
    verificationRequestSchema.parse({
      id: "ver_1",
      kind: "teacher",
      displayName: "Neda Teacher",
      status: "pending",
      submittedAt: new Date().toISOString(),
    }),
    verificationRequestSchema.parse({
      id: "ver_2",
      kind: "school",
      displayName: "Sunrise School",
      status: "pending",
      submittedAt: new Date().toISOString(),
    }),
  );
}

export function createHttpVerificationClient(): VerificationClient {
  return {
    async list() {
      return apiRequest("/admin/verification", {
        parse: (data) => z.array(verificationRequestSchema).parse(data),
      });
    },
    async approve(id) {
      return apiRequest(
        `/admin/verification/${encodeURIComponent(id)}/approve`,
        {
          method: "POST",
          parse: (data) => verificationRequestSchema.parse(data),
        },
      );
    },
    async reject(id) {
      return apiRequest(
        `/admin/verification/${encodeURIComponent(id)}/reject`,
        {
          method: "POST",
          parse: (data) => verificationRequestSchema.parse(data),
        },
      );
    },
  };
}

export function createMockVerificationClient(): VerificationClient {
  return {
    async list() {
      seed();
      return [...memory];
    },
    async approve(id) {
      seed();
      const idx = memory.findIndex((r) => r.id === id);
      if (idx < 0) throw new Error("not_found");
      memory[idx] = verificationRequestSchema.parse({
        ...memory[idx],
        status: "approved",
      });
      return memory[idx]!;
    },
    async reject(id) {
      seed();
      const idx = memory.findIndex((r) => r.id === id);
      if (idx < 0) throw new Error("not_found");
      memory[idx] = verificationRequestSchema.parse({
        ...memory[idx],
        status: "rejected",
      });
      return memory[idx]!;
    },
  };
}

let client: VerificationClient = createMockVerificationClient();
export function getVerificationClient() {
  return client;
}
export function setVerificationClient(next: VerificationClient) {
  client = next;
}
