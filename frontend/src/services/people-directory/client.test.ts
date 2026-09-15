import { describe, expect, it } from "vitest";

import { resolveVisiblePresence } from "./client";

describe("people directory presence", () => {
  it("hides presence when not visible", () => {
    expect(
      resolveVisiblePresence({
        presenceStatus: "busy",
        presenceVisible: false,
      }),
    ).toBe("hidden");
    expect(
      resolveVisiblePresence({
        presenceStatus: "available",
        presenceVisible: true,
      }),
    ).toBe("available");
  });
});
