import { describe, expect, it } from "vitest";

import { SOLO_ARCHITECTURE_VERSION } from "./architecture";

describe("architecture contract", () => {
  it("exposes a stable architecture version marker", () => {
    expect(SOLO_ARCHITECTURE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
