import { describe, expect, it } from "vitest";
import {
  canViewPrivatePipeline,
  createMockCrmClient,
  __resetMockCrm,
} from "./client";

describe("canViewPrivatePipeline", () => {
  it("allows public pipelines for everyone", () => {
    expect(canViewPrivatePipeline(false, false)).toBe(true);
  });

  it("restricts private pipelines without manage permission", () => {
    expect(canViewPrivatePipeline(true, false)).toBe(false);
    expect(canViewPrivatePipeline(true, true)).toBe(true);
  });
});

describe("crm client", () => {
  it("creates pipeline and deal", async () => {
    __resetMockCrm();
    const client = createMockCrmClient();
    const pipeline = await client.createPipeline("org_1", {
      name: "Admissions",
      isPrivate: true,
      stageLabels: ["Lead", "Won"],
    });
    expect(pipeline.isPrivate).toBe(true);
    const deal = await client.createDeal("org_1", {
      title: "Family enrollment",
      pipelineName: "Admissions",
      stage: "Lead",
      valueMinor: 500000,
    });
    expect(deal.title).toBe("Family enrollment");
  });
});
