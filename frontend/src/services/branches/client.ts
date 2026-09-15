import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const branchStatusSchema = z.enum(["active", "archived"]);
export type BranchStatus = z.infer<typeof branchStatusSchema>;

export const branchSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  name: z.string().min(1),
  code: z.string().min(1),
  isMain: z.boolean(),
  status: branchStatusSchema,
  effectiveFrom: z.string().min(1),
  effectiveTo: z.string().nullable(),
  address: z.string(),
});
export type Branch = z.infer<typeof branchSchema>;
export const branchesCollectionSchema = collectionSchema(branchSchema);

export type CreateBranchInput = {
  name: string;
  code: string;
  effectiveFrom: string;
  address?: string;
};

export type BranchesClient = {
  list(organizationId: string): Promise<{
    data: Branch[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(organizationId: string, input: CreateBranchInput): Promise<Branch>;
  setMain(organizationId: string, branchId: string): Promise<Branch>;
  archive(organizationId: string, branchId: string): Promise<Branch>;
};

const memory = new Map<string, Branch[]>();

function meta(data: Branch[]) {
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

/** Main branch cannot be archived while it remains the org main. */
export function canArchiveBranch(branch: Pick<Branch, "isMain" | "status">) {
  return !branch.isMain && branch.status === "active";
}

export function createHttpBranchesClient(): BranchesClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/branches`,
        { parse: (data) => branchesCollectionSchema.parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/branches`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => branchSchema.parse(data),
        },
      );
    },
    async setMain(organizationId, branchId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/branches/${encodeURIComponent(branchId)}/set-main`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => branchSchema.parse(data),
        },
      );
    },
    async archive(organizationId, branchId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/branches/${encodeURIComponent(branchId)}/archive`,
        {
          method: "POST",
          body: JSON.stringify({}),
          parse: (data) => branchSchema.parse(data),
        },
      );
    },
  };
}

export function createMockBranchesClient(): BranchesClient {
  return {
    async list(organizationId) {
      ensureMain(organizationId);
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      ensureMain(organizationId);
      const row = branchSchema.parse({
        id: opaqueIdSchema.parse(
          `br_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        name: input.name.trim(),
        code: input.code.trim().toUpperCase(),
        isMain: false,
        status: "active",
        effectiveFrom: input.effectiveFrom,
        effectiveTo: null,
        address: (input.address ?? "").trim(),
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
    async setMain(organizationId, branchId) {
      const rows = memory.get(organizationId) ?? [];
      const target = rows.find((row) => String(row.id) === branchId);
      if (!target || target.status === "archived") {
        throw new Error("NOT_FOUND");
      }
      const next = rows.map((row) =>
        branchSchema.parse({
          ...row,
          isMain: String(row.id) === branchId,
        }),
      );
      memory.set(organizationId, next);
      return next.find((row) => String(row.id) === branchId)!;
    },
    async archive(organizationId, branchId) {
      const rows = memory.get(organizationId) ?? [];
      const idx = rows.findIndex((row) => String(row.id) === branchId);
      if (idx < 0) throw new Error("NOT_FOUND");
      const current = rows[idx]!;
      if (!canArchiveBranch(current)) {
        throw new Error("branches.cannotArchiveMain");
      }
      const updated = branchSchema.parse({
        ...current,
        status: "archived",
        effectiveTo: new Date().toISOString().slice(0, 10),
        isMain: false,
      });
      memory.set(
        organizationId,
        rows.map((row, i) => (i === idx ? updated : row)),
      );
      return updated;
    },
  };
}

function ensureMain(organizationId: string) {
  const existing = memory.get(organizationId);
  if (existing && existing.length > 0) return;
  const main = branchSchema.parse({
    id: opaqueIdSchema.parse(`br_main_${organizationId}`),
    organizationId: opaqueIdSchema.parse(organizationId),
    name: "Main Branch",
    code: "MAIN",
    isMain: true,
    status: "active",
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: null,
    address: "",
  });
  memory.set(organizationId, [main]);
}

let client: BranchesClient = createMockBranchesClient();
export function getBranchesClient() {
  return client;
}
export function setBranchesClient(next: BranchesClient) {
  client = next;
}
export function __resetMockBranches() {
  memory.clear();
  client = createMockBranchesClient();
}

/** Seed helper for MSW/org bootstrap. */
export function __seedMainBranch(
  organizationId: string,
  mainBranchId: string,
  name = "Main Branch",
) {
  memory.set(organizationId, [
    branchSchema.parse({
      id: opaqueIdSchema.parse(mainBranchId),
      organizationId: opaqueIdSchema.parse(organizationId),
      name,
      code: "MAIN",
      isMain: true,
      status: "active",
      effectiveFrom: new Date().toISOString().slice(0, 10),
      effectiveTo: null,
      address: "",
    }),
  ]);
}
