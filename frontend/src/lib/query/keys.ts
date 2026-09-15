import type { OpaqueId } from "@/services/api";

export type QueryContext = {
  personaId?: OpaqueId | string;
  organizationId?: OpaqueId | string | null;
  subjectId?: OpaqueId | string | null;
};

export function createQueryKeyFactory(scope: string) {
  return {
    all: (ctx: QueryContext) =>
      [
        scope,
        ctx.personaId ?? "persona:none",
        ctx.organizationId ?? "org:personal",
        ctx.subjectId ?? "subject:none",
      ] as const,
    lists: (ctx: QueryContext) =>
      [...createQueryKeyFactory(scope).all(ctx), "list"] as const,
    list: (ctx: QueryContext, filters: Record<string, unknown>) =>
      [...createQueryKeyFactory(scope).lists(ctx), filters] as const,
    details: (ctx: QueryContext) =>
      [...createQueryKeyFactory(scope).all(ctx), "detail"] as const,
    detail: (ctx: QueryContext, id: string) =>
      [...createQueryKeyFactory(scope).details(ctx), id] as const,
  };
}

export const studentsQueryKeys = createQueryKeyFactory("students");
