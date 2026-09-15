import { describe, expect, it } from "vitest";

import { filterDirectoryPeople, resolveDirectoryFilter } from "./schemas";

describe("people directory schemas", () => {
  it("defaults filter to all", () => {
    expect(resolveDirectoryFilter(null)).toBe("all");
    expect(resolveDirectoryFilter("busy")).toBe("busy");
  });

  it("filters only visible matching presence", () => {
    const rows = [
      { presenceStatus: "busy", presenceVisible: true },
      { presenceStatus: "busy", presenceVisible: false },
      { presenceStatus: "available", presenceVisible: true },
    ];
    expect(filterDirectoryPeople(rows, "busy")).toHaveLength(1);
  });
});
