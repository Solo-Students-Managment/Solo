import { describe, expect, it } from "vitest";
import { canActorDecide } from "./client";
describe("approvals helpers", () => {
  it("blocks self approval", () => {
    expect(
      canActorDecide({ requesterDisplayName: "Ada", status: "pending" }, "Ada"),
    ).toBe(false);
    expect(
      canActorDecide({ requesterDisplayName: "Ada", status: "pending" }, "Sam"),
    ).toBe(true);
  });
});
