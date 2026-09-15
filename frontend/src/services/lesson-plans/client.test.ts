import { describe, expect, it } from "vitest";

import { hasMeaningfulBody, nextCloneVersion } from "./client";

describe("lesson plan helpers", () => {
  it("detects empty rich-text bodies", () => {
    expect(hasMeaningfulBody("<p></p>")).toBe(false);
    expect(hasMeaningfulBody("<p>Warm-up</p>")).toBe(true);
  });

  it("increments clone version without mutating source", () => {
    expect(nextCloneVersion(1)).toBe(2);
    expect(nextCloneVersion(4)).toBe(5);
  });
});
