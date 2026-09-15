import { describe, expect, it } from "vitest";

import { assertNamespaceParity, t } from "./t";

describe("i18n translator", () => {
  it("returns fa and en foundation strings", () => {
    expect(t("fa", "foundation", "brand")).toBe("Solo");
    expect(t("en", "foundation", "title")).toBe("Frontend foundation");
  });

  it("supports simple pluralization", () => {
    expect(t("en", "foundation", "itemCount", { count: 0 })).toContain("No");
    expect(t("en", "foundation", "itemCount", { count: 1 })).toContain("1");
    expect(t("en", "foundation", "itemCount", { count: 3 })).toContain("3");
  });

  it("keeps fa/en namespace key parity", () => {
    expect(assertNamespaceParity("foundation")).toEqual([]);
    expect(assertNamespaceParity("common")).toEqual([]);
  });
});
