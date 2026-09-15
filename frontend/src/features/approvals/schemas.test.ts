import { describe, expect, it } from "vitest";
import { createApprovalSchema } from "./schemas";
describe("approvals schemas", () => {
  it("requires title", () => {
    expect(
      createApprovalSchema.safeParse({
        title: "",
        requesterDisplayName: "Ada",
        mode: "sequential",
        summary: "x",
      }).success,
    ).toBe(false);
  });
});
