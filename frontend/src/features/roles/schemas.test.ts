import { describe, expect, it } from "vitest";

import { createRoleSchema, parsePermissionsText } from "./schemas";

describe("roles schemas", () => {
  it("parses permission lists", () => {
    expect(parsePermissionsText("a, b\nc")).toEqual(["a", "b", "c"]);
  });

  it("requires name", () => {
    expect(
      createRoleSchema.safeParse({
        name: "",
        templateKey: "teacher",
        branchScoped: true,
        permissionsText: "courses.view",
      }).success,
    ).toBe(false);
  });
});
