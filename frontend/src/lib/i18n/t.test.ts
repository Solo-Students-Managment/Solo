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
    expect(assertNamespaceParity("auth")).toEqual([]);
    expect(assertNamespaceParity("security")).toEqual([]);
    expect(assertNamespaceParity("accountPhone")).toEqual([]);
    expect(assertNamespaceParity("profile")).toEqual([]);
    expect(assertNamespaceParity("organization")).toEqual([]);
    expect(assertNamespaceParity("teacher")).toEqual([]);
    expect(assertNamespaceParity("student")).toEqual([]);
    expect(assertNamespaceParity("guardian")).toEqual([]);
    expect(assertNamespaceParity("subjects")).toEqual([]);
    expect(assertNamespaceParity("students")).toEqual([]);
    expect(assertNamespaceParity("courses")).toEqual([]);
    expect(assertNamespaceParity("enrollments")).toEqual([]);
    expect(assertNamespaceParity("sessions")).toEqual([]);
    expect(assertNamespaceParity("attendance")).toEqual([]);
    expect(assertNamespaceParity("assignments")).toEqual([]);
    expect(assertNamespaceParity("gradebook")).toEqual([]);
    expect(assertNamespaceParity("evaluations")).toEqual([]);
    expect(assertNamespaceParity("search")).toEqual([]);
    expect(assertNamespaceParity("reports")).toEqual([]);
    expect(assertNamespaceParity("resources")).toEqual([]);
    expect(assertNamespaceParity("tuition")).toEqual([]);
    expect(assertNamespaceParity("calendar")).toEqual([]);
    expect(assertNamespaceParity("notifications")).toEqual([]);
    expect(assertNamespaceParity("chat")).toEqual([]);
    expect(assertNamespaceParity("messaging")).toEqual([]);
    expect(assertNamespaceParity("home")).toEqual([]);
  });
});
