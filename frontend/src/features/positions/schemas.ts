import { z } from "zod";

export const positionsTabs = ["positions", "chart"] as const;
export type PositionsTab = (typeof positionsTabs)[number];

export function resolvePositionsTab(raw: string | null): PositionsTab {
  if (raw && (positionsTabs as readonly string[]).includes(raw)) {
    return raw as PositionsTab;
  }
  return "positions";
}

export const createPositionSchema = z.object({
  title: z.string().trim().min(1, "positions.validation.title"),
  departmentId: z.string().optional(),
  reportsToPositionId: z.string().optional(),
  holderDisplayName: z.string().optional(),
});
export type CreatePositionValues = z.infer<typeof createPositionSchema>;
