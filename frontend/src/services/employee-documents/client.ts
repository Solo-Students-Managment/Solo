import { z } from "zod";
import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const documentStatusSchema = z.enum(["active", "expired", "archived"]);
export type DocumentStatus = z.infer<typeof documentStatusSchema>;

export const employeeDocumentSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  staffDisplayName: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  status: documentStatusSchema,
  expiresOn: z.string().nullable(),
});
export type EmployeeDocument = z.infer<typeof employeeDocumentSchema>;
export const employeeDocumentsCollectionSchema = collectionSchema(
  employeeDocumentSchema,
);

export type CreateEmployeeDocumentInput = {
  staffDisplayName: string;
  title: string;
  category: string;
  expiresOn?: string | null;
};

export type EmployeeDocumentsClient = {
  list(organizationId: string): Promise<{
    data: EmployeeDocument[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(
    organizationId: string,
    input: CreateEmployeeDocumentInput,
  ): Promise<EmployeeDocument>;
};

const memory = new Map<string, EmployeeDocument[]>();
function meta(data: EmployeeDocument[]) {
  return {
    data,
    meta: {
      page: 1,
      pageSize: Math.max(data.length, 1),
      totalItems: data.length,
      totalPages: 1,
    },
  };
}

export function isDocumentExpired(status: DocumentStatus) {
  return status === "expired";
}

export function createHttpEmployeeDocumentsClient(): EmployeeDocumentsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/employee-documents`,
        {
          parse: (data) => employeeDocumentsCollectionSchema.parse(data),
        },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/employee-documents`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => employeeDocumentSchema.parse(data),
        },
      );
    },
  };
}

export function createMockEmployeeDocumentsClient(): EmployeeDocumentsClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const row = employeeDocumentSchema.parse({
        id: opaqueIdSchema.parse(
          `edoc_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        staffDisplayName: input.staffDisplayName.trim(),
        title: input.title.trim(),
        category: input.category.trim(),
        status: "active",
        expiresOn: input.expiresOn?.trim() || null,
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
  };
}

let client: EmployeeDocumentsClient = createMockEmployeeDocumentsClient();
export function getEmployeeDocumentsClient() {
  return client;
}
export function setEmployeeDocumentsClient(next: EmployeeDocumentsClient) {
  client = next;
}
export function __resetMockEmployeeDocuments() {
  memory.clear();
  client = createMockEmployeeDocumentsClient();
}
