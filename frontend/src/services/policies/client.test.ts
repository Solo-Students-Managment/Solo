import { describe, expect, it } from "vitest";

import { canPublishPolicy } from "./client";

describe("policies helpers", () => {
  it("only drafts can publish", () => {
    expect(canPublishPolicy({ status: "draft" })).toBe(true);
    expect(canPublishPolicy({ status: "published" })).toBe(false);
  });
});
