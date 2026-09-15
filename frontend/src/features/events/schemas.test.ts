import { describe, expect, it } from "vitest";
import { createEventSchema } from "./schemas";

describe("createEventSchema", () => {
  it("requires positive capacity", () => {
    expect(
      createEventSchema.safeParse({
        title: "Open day",
        startsAt: "2026-10-01T10:00:00.000Z",
        capacity: 0,
        waitlistEnabled: false,
      }).success,
    ).toBe(false);
  });
});
