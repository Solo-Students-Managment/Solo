import { describe, expect, it } from "vitest";
import { createBulkJobSchema } from "./schemas";

describe("createBulkJobSchema", () => {
  it("requires positive item count", () => {
    expect(
      createBulkJobSchema.safeParse({
        moduleKey: "students",
        actionKey: "tag",
        itemCount: 0,
      }).success,
    ).toBe(false);
  });
});
