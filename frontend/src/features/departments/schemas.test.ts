import { describe, expect, it } from "vitest";

import { createTeamSchema, resolveDepartmentsTab } from "./schemas";

describe("departments schemas", () => {
  it("defaults tab to departments", () => {
    expect(resolveDepartmentsTab(null)).toBe("departments");
    expect(resolveDepartmentsTab("teams")).toBe("teams");
  });

  it("requires department for team", () => {
    expect(
      createTeamSchema.safeParse({
        departmentId: "",
        name: "Alpha",
        code: "A1",
      }).success,
    ).toBe(false);
  });
});
