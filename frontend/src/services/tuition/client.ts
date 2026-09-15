import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const tuitionRecordSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  studentDisplayName: z.string().min(1),
  amountMinor: z.number().int().nonnegative(),
  currency: z.literal("IRR"),
  status: z.enum(["due", "partial", "paid", "waived"]),
  dueAt: z.string().min(1),
});
export type TuitionRecord = z.infer<typeof tuitionRecordSchema>;
export const tuitionCollectionSchema = collectionSchema(tuitionRecordSchema);

export type TuitionClient = {
  list(
    organizationId: string,
  ): Promise<z.infer<typeof tuitionCollectionSchema>>;
  record(
    organizationId: string,
    input: {
      studentDisplayName: string;
      amountMinor: number;
      dueAt: string;
      status: TuitionRecord["status"];
    },
  ): Promise<TuitionRecord>;
};

const memory = new Map<string, TuitionRecord[]>();

export function createHttpTuitionClient(): TuitionClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/tuition`,
        {
          parse: (data) => tuitionCollectionSchema.parse(data),
        },
      );
    },
    async record(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/tuition`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => tuitionRecordSchema.parse(data),
        },
      );
    },
  };
}

export function createMockTuitionClient(): TuitionClient {
  return {
    async list(organizationId) {
      const data = memory.get(organizationId) ?? [];
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
    async record(organizationId, input) {
      const item = tuitionRecordSchema.parse({
        id: opaqueIdSchema.parse(
          `tui_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        studentDisplayName: input.studentDisplayName.trim(),
        amountMinor: input.amountMinor,
        currency: "IRR",
        status: input.status,
        dueAt: input.dueAt,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), item]);
      return item;
    },
  };
}

let client: TuitionClient = createMockTuitionClient();
export function getTuitionClient() {
  return client;
}
export function setTuitionClient(next: TuitionClient) {
  client = next;
}
