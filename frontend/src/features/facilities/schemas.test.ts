import { describe, expect, it } from "vitest";

import { createRoomSchema, resolveFacilitiesTab } from "./schemas";

describe("facilities schemas", () => {
  it("defaults tab to rooms", () => {
    expect(resolveFacilitiesTab(null)).toBe("rooms");
    expect(resolveFacilitiesTab("equipment")).toBe("equipment");
  });

  it("requires room capacity", () => {
    expect(
      createRoomSchema.safeParse({
        branchId: "br_1",
        name: "Lab A",
        capacity: "0",
      }).success,
    ).toBe(false);
  });
});
