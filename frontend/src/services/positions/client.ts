import { z } from "zod";

import { apiRequest, collectionSchema, opaqueIdSchema } from "@/services/api";

export const positionStatusSchema = z.enum(["filled", "vacant", "archived"]);
export type PositionStatus = z.infer<typeof positionStatusSchema>;

export const positionSchema = z.object({
  id: opaqueIdSchema,
  organizationId: opaqueIdSchema,
  title: z.string().min(1),
  departmentId: opaqueIdSchema.nullable(),
  departmentName: z.string().nullable(),
  reportsToPositionId: opaqueIdSchema.nullable(),
  /** Public display name only — never email/phone/PII contact fields. */
  holderDisplayName: z.string().nullable(),
  status: positionStatusSchema,
});
export type Position = z.infer<typeof positionSchema>;
export const positionsCollectionSchema = collectionSchema(positionSchema);

export type CreatePositionInput = {
  title: string;
  departmentId?: string | null;
  reportsToPositionId?: string | null;
  holderDisplayName?: string | null;
};

export type PositionsClient = {
  list(organizationId: string): Promise<{
    data: Position[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }>;
  create(organizationId: string, input: CreatePositionInput): Promise<Position>;
};

const memory = new Map<string, Position[]>();

function meta(data: Position[]) {
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

export function isPositionVacant(status: PositionStatus) {
  return status === "vacant";
}

export type OrgChartNode = {
  position: Position;
  children: OrgChartNode[];
};

/** Build a forest of positions from reportsTo links (cycle-safe). */
export function buildOrgChartForest(positions: Position[]): OrgChartNode[] {
  const byId = new Map(positions.map((p) => [String(p.id), p]));
  const children = new Map<string, Position[]>();
  const roots: Position[] = [];

  for (const pos of positions) {
    const parentId = pos.reportsToPositionId
      ? String(pos.reportsToPositionId)
      : null;
    if (parentId && byId.has(parentId) && parentId !== String(pos.id)) {
      const list = children.get(parentId) ?? [];
      list.push(pos);
      children.set(parentId, list);
    } else {
      roots.push(pos);
    }
  }

  function toNode(pos: Position, stack: Set<string>): OrgChartNode {
    const id = String(pos.id);
    if (stack.has(id)) {
      return { position: pos, children: [] };
    }
    const next = new Set(stack);
    next.add(id);
    return {
      position: pos,
      children: (children.get(id) ?? []).map((child) => toNode(child, next)),
    };
  }

  return roots.map((root) => toNode(root, new Set()));
}

export function createHttpPositionsClient(): PositionsClient {
  return {
    async list(organizationId) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/positions`,
        { parse: (data) => positionsCollectionSchema.parse(data) },
      );
    },
    async create(organizationId, input) {
      return apiRequest(
        `/organizations/${encodeURIComponent(organizationId)}/positions`,
        {
          method: "POST",
          body: JSON.stringify(input),
          parse: (data) => positionSchema.parse(data),
        },
      );
    },
  };
}

export function createMockPositionsClient(): PositionsClient {
  return {
    async list(organizationId) {
      return meta(memory.get(organizationId) ?? []);
    },
    async create(organizationId, input) {
      const holder = input.holderDisplayName?.trim() || null;
      const row = positionSchema.parse({
        id: opaqueIdSchema.parse(
          `pos_${Math.random().toString(36).slice(2, 10)}`,
        ),
        organizationId: opaqueIdSchema.parse(organizationId),
        title: input.title.trim(),
        departmentId: input.departmentId
          ? opaqueIdSchema.parse(input.departmentId)
          : null,
        departmentName: null,
        reportsToPositionId: input.reportsToPositionId
          ? opaqueIdSchema.parse(input.reportsToPositionId)
          : null,
        holderDisplayName: holder,
        status: holder ? "filled" : "vacant",
      });
      memory.set(organizationId, [...(memory.get(organizationId) ?? []), row]);
      return row;
    },
  };
}

let client: PositionsClient = createMockPositionsClient();
export function getPositionsClient() {
  return client;
}
export function setPositionsClient(next: PositionsClient) {
  client = next;
}
export function __resetMockPositions() {
  memory.clear();
  client = createMockPositionsClient();
}
