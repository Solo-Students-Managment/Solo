import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const reportViewSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  kind: z.enum(["attendance", "grades", "enrollment"]),
  format: z.enum(["csv", "json"]),
});
export type ReportView = z.infer<typeof reportViewSchema>;
export const reportsCollectionSchema = collectionSchema(reportViewSchema);

export type ReportsClient = {
  list(
    organizationId: string,
  ): Promise<z.infer<typeof reportsCollectionSchema>>;
  saveView(
    organizationId: string,
    input: {
      name: string;
      kind: ReportView["kind"];
      format: ReportView["format"];
    },
  ): Promise<ReportView>;
  exportView(
    organizationId: string,
    viewId: string,
  ): Promise<{ content: string; format: ReportView["format"] }>;
};

const memory = new Map<string, ReportView[]>();

export function createHttpReportsClient(): ReportsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/reports`,
        {
          parse: (data) => reportsCollectionSchema.parse(data),
        },
      );
    },
    async saveView(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/reports`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => reportViewSchema.parse(data),
        },
      );
    },
    async exportView(organizationId, viewId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/reports/${encodeURIComponent(viewId)}/export`,
        {
          parse: (data) =>
            z
              .object({ content: z.string(), format: z.enum(["csv", "json"]) })
              .parse(data),
        },
      );
    },
  };
}

export function createMockReportsClient(): ReportsClient {
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
    async saveView(organizationId, input) {
      const item = reportViewSchema.parse({
        id: opaqueIdSchema.parse(
          `rpt_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        kind: input.kind,
        format: input.format,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), item]);
      return item;
    },
    async exportView(organizationId, viewId) {
      const view = (memory.get(organizationId) ?? []).find(
        (row) => String(row.id) === viewId,
      );
      if (!view) throw new Error("NOT_FOUND");
      if (view.format === "json") {
        return {
          content: JSON.stringify({ kind: view.kind, rows: [] }),
          format: "json",
        };
      }
      return { content: "kind,value\\n" + view.kind + ",0\\n", format: "csv" };
    },
  };
}

let client: ReportsClient = createMockReportsClient();
export function getReportsClient() {
  return client;
}
export function setReportsClient(next: ReportsClient) {
  client = next;
}
