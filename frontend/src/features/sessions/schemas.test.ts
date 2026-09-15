import { describe, expect, it } from "vitest";

import { createSessionSchema } from "./schemas";

describe("createSessionSchema", () => {
  it("accepts session schedule payload", () => {
    expect(
      createSessionSchema.safeParse({
        className: "Section A",
        startsAt: "2026-09-15T10:00",
        endsAt: "2026-09-15T11:00",
        recurrenceLabel: "Weekly",
      }).success,
    ).toBe(true);
  });
});
