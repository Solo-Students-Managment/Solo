import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const featureFlagSchema = z.object({
  id: opaqueIdSchema,
  key: z.string().min(1),
  label: z.string().min(1),
  enabled: z.boolean(),
  earlyAccess: z.boolean(),
});
export type FeatureFlag = z.infer<typeof featureFlagSchema>;

export type FeatureFlagsClient = {
  list(): Promise<FeatureFlag[]>;
  toggle(id: string, enabled: boolean): Promise<FeatureFlag>;
  setEarlyAccess(id: string, earlyAccess: boolean): Promise<FeatureFlag>;
};

const memory: FeatureFlag[] = [];

function seed() {
  if (memory.length) return;
  memory.push(
    featureFlagSchema.parse({
      id: "ff_1",
      key: "reports.v2",
      label: "Reports v2",
      enabled: false,
      earlyAccess: true,
    }),
    featureFlagSchema.parse({
      id: "ff_2",
      key: "chat.voice",
      label: "Voice chat",
      enabled: true,
      earlyAccess: false,
    }),
  );
}

export function createHttpFeatureFlagsClient(): FeatureFlagsClient {
  return {
    async list() {
      return apiRequest("/admin/feature-flags", {
        parse: (d) => z.array(featureFlagSchema).parse(d),
      });
    },
    async toggle(id, enabled) {
      return apiRequest(
        `/admin/feature-flags/${encodeURIComponent(id)}/toggle`,
        {
          method: "POST",
          body: JSON.stringify({ enabled }),
          parse: (d) => featureFlagSchema.parse(d),
        },
      );
    },
    async setEarlyAccess(id, earlyAccess) {
      return apiRequest(
        `/admin/feature-flags/${encodeURIComponent(id)}/early-access`,
        {
          method: "POST",
          body: JSON.stringify({ earlyAccess }),
          parse: (d) => featureFlagSchema.parse(d),
        },
      );
    },
  };
}

export function createMockFeatureFlagsClient(): FeatureFlagsClient {
  return {
    async list() {
      seed();
      return [...memory];
    },
    async toggle(id, enabled) {
      seed();
      const idx = memory.findIndex((f) => f.id === id);
      if (idx < 0) throw new Error("not_found");
      memory[idx] = featureFlagSchema.parse({ ...memory[idx], enabled });
      return memory[idx]!;
    },
    async setEarlyAccess(id, earlyAccess) {
      seed();
      const idx = memory.findIndex((f) => f.id === id);
      if (idx < 0) throw new Error("not_found");
      memory[idx] = featureFlagSchema.parse({ ...memory[idx], earlyAccess });
      return memory[idx]!;
    },
  };
}

let client: FeatureFlagsClient = createMockFeatureFlagsClient();
export function getFeatureFlagsClient() {
  return client;
}
export function setFeatureFlagsClient(next: FeatureFlagsClient) {
  client = next;
}
