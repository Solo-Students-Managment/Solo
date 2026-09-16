import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const incidentSchema = z.object({
  id: opaqueIdSchema,
  title: z.string().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["investigating", "identified", "monitoring", "resolved"]),
  updatedAt: z.string().min(1),
});
export type Incident = z.infer<typeof incidentSchema>;

export type IncidentsClient = {
  list(): Promise<Incident[]>;
  create(input: {
    title: string;
    severity: Incident["severity"];
  }): Promise<Incident>;
  updateStatus(id: string, status: Incident["status"]): Promise<Incident>;
};

const memory: Incident[] = [];

export function createHttpIncidentsClient(): IncidentsClient {
  return {
    async list() {
      return apiRequest("/admin/incidents", {
        parse: (d) => z.array(incidentSchema).parse(d),
      });
    },
    async create(input) {
      return apiRequest("/admin/incidents", {
        method: "POST",
        body: JSON.stringify(input),
        parse: (d) => incidentSchema.parse(d),
      });
    },
    async updateStatus(id, status) {
      return apiRequest(`/admin/incidents/${encodeURIComponent(id)}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
        parse: (d) => incidentSchema.parse(d),
      });
    },
  };
}

export function createMockIncidentsClient(): IncidentsClient {
  return {
    async list() {
      return [...memory];
    },
    async create(input) {
      const row = incidentSchema.parse({
        id: `inc_${Date.now()}`,
        title: input.title,
        severity: input.severity,
        status: "investigating",
        updatedAt: new Date().toISOString(),
      });
      memory.unshift(row);
      return row;
    },
    async updateStatus(id, status) {
      const idx = memory.findIndex((i) => i.id === id);
      if (idx < 0) throw new Error("not_found");
      memory[idx] = incidentSchema.parse({
        ...memory[idx],
        status,
        updatedAt: new Date().toISOString(),
      });
      return memory[idx]!;
    },
  };
}

let client: IncidentsClient = createMockIncidentsClient();
export function getIncidentsClient() {
  return client;
}
export function setIncidentsClient(next: IncidentsClient) {
  client = next;
}
