import { describe, expect, it } from "vitest";

import { preservesHistoryOnClone } from "./client";

describe("courses lifecycle helpers", () => {
  it("never copies historical records on clone or continuation", () => {
    expect(preservesHistoryOnClone()).toBe(false);
  });
});
