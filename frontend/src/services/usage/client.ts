import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const quotaMeterSchema = z.object({
  resource: z.string().min(1),
  used: z.number().int().nonnegative(),
  quota: z.number().int().nonnegative(),
  unit: z.string().min(1),
});
export type QuotaMeter = z.infer<typeof quotaMeterSchema>;

export const usageSnapshotSchema = z.object({
  organizationId: opaqueIdSchema,
  meters: z.array(quotaMeterSchema),
  updatedAt: z.string().min(1),
});
export type UsageSnapshot = z.infer<typeof usageSnapshotSchema>;

export function isOverQuota(meter: QuotaMeter): boolean {
  return meter.used > meter.quota;
}

export function quotaPercent(meter: QuotaMeter): number {
  if (meter.quota === 0) return meter.used > 0 ? 100 : 0;
  return Math.min(100, Math.round((meter.used / meter.quota) * 100));
}

export type UsageClient = {
  get(organizationId: string): Promise<UsageSnapshot>;
};

const seed: QuotaMeter[] = [
  quotaMeterSchema.parse({
    resource: "students",
    used: 120,
    quota: 100,
    unit: "seats",
  }),
  quotaMeterSchema.parse({
    resource: "storage",
    used: 42,
    quota: 50,
    unit: "GB",
  }),
  quotaMeterSchema.parse({
    resource: "api_calls",
    used: 8500,
    quota: 10000,
    unit: "calls",
  }),
];

export function createHttpUsageClient(): UsageClient {
  return {
    async get(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/usage`,
        { parse: (data) => usageSnapshotSchema.parse(data) },
      );
    },
  };
}

export function createMockUsageClient(): UsageClient {
  return {
    async get(organizationId) {
      return usageSnapshotSchema.parse({
        organizationId,
        meters: seed,
        updatedAt: new Date().toISOString(),
      });
    },
  };
}

let client: UsageClient = createMockUsageClient();
export function getUsageClient() {
  return client;
}
export function setUsageClient(next: UsageClient) {
  client = next;
}
