import { z } from "zod";

export const facilitiesTabs = ["rooms", "equipment"] as const;
export type FacilitiesTab = (typeof facilitiesTabs)[number];

export function resolveFacilitiesTab(raw: string | null): FacilitiesTab {
  if (raw && (facilitiesTabs as readonly string[]).includes(raw)) {
    return raw as FacilitiesTab;
  }
  return "rooms";
}

export const createRoomSchema = z.object({
  branchId: z.string().trim().min(1, "facilities.validation.branch"),
  name: z.string().trim().min(1, "facilities.validation.roomName"),
  capacity: z.coerce
    .number()
    .int("facilities.validation.capacity")
    .min(1, "facilities.validation.capacity"),
});
export type CreateRoomValues = z.infer<typeof createRoomSchema>;

export const createEquipmentSchema = z.object({
  branchId: z.string().trim().min(1, "facilities.validation.branch"),
  name: z.string().trim().min(1, "facilities.validation.equipmentName"),
  assetTag: z.string().trim().min(1, "facilities.validation.assetTag"),
});
export type CreateEquipmentValues = z.infer<typeof createEquipmentSchema>;
