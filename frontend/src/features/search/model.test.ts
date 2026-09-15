import { describe, expect, it } from "vitest";

import { filterAuthorizedResults } from "./model";

describe("search authorization filter", () => {
  it("never returns unauthorized titles", () => {
    const result = filterAuthorizedResults([
      { allowed: true, title: "Visible" },
      { allowed: false, title: "Secret" },
    ]);
    expect(result).toEqual([{ allowed: true, title: "Visible" }]);
  });
});
