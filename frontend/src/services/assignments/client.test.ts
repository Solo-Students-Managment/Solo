import { describe, expect, it } from "vitest";

import { canRequestRevision } from "./client";

describe("assignment revision policy", () => {
  it("allows revisions under the configured limit", () => {
    expect(canRequestRevision({ revisionsCount: 0, maxRevisions: 1 })).toBe(
      true,
    );
    expect(canRequestRevision({ revisionsCount: 1, maxRevisions: 1 })).toBe(
      false,
    );
  });
});
