import { describe, expect, it } from "vitest";

import { canArchiveBranch } from "./client";

describe("branch helpers", () => {
  it("blocks archiving the main branch", () => {
    expect(canArchiveBranch({ isMain: true, status: "active" })).toBe(false);
    expect(canArchiveBranch({ isMain: false, status: "active" })).toBe(true);
    expect(canArchiveBranch({ isMain: false, status: "archived" })).toBe(false);
  });
});
