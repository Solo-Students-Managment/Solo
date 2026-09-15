import { describe, expect, it } from "vitest";

import { createOrganizationSchema } from "./schemas";

describe("createOrganizationSchema", () => {
  it("requires name and accepts school or institute", () => {
    expect(
      createOrganizationSchema.safeParse({ name: "", type: "school" }).success,
    ).toBe(false);
    expect(
      createOrganizationSchema.parse({ name: "Solo School", type: "institute" })
        .type,
    ).toBe("institute");
  });
});
