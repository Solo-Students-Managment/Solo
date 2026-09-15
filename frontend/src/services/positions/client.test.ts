import { describe, expect, it } from "vitest";

import { buildOrgChartForest, isPositionVacant, type Position } from "./client";
import { opaqueIdSchema } from "@/services/api";

function pos(
  id: string,
  title: string,
  reportsTo: string | null = null,
): Position {
  return {
    id: opaqueIdSchema.parse(id),
    organizationId: opaqueIdSchema.parse("org_1"),
    title,
    departmentId: null,
    departmentName: null,
    reportsToPositionId: reportsTo ? opaqueIdSchema.parse(reportsTo) : null,
    holderDisplayName: null,
    status: "vacant",
  };
}

describe("positions helpers", () => {
  it("detects vacant status", () => {
    expect(isPositionVacant("vacant")).toBe(true);
    expect(isPositionVacant("filled")).toBe(false);
  });

  it("builds org chart forest from reportsTo", () => {
    const forest = buildOrgChartForest([
      pos("pos_root", "Principal"),
      pos("pos_vp", "Vice Principal", "pos_root"),
      pos("pos_teach", "Teacher Lead", "pos_vp"),
    ]);
    expect(forest).toHaveLength(1);
    expect(forest[0]?.position.title).toBe("Principal");
    expect(forest[0]?.children[0]?.position.title).toBe("Vice Principal");
    expect(forest[0]?.children[0]?.children[0]?.position.title).toBe(
      "Teacher Lead",
    );
  });
});
