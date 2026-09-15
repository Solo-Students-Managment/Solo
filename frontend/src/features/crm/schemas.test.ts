import { describe, expect, it } from "vitest";
import { createDealSchema, createPipelineSchema } from "./schemas";

describe("crm schemas", () => {
  it("parses pipeline stages from comma-separated input", () => {
    const result = createPipelineSchema.safeParse({
      name: "Sales",
      isPrivate: false,
      stageLabels: "Lead, Qualified, Won",
    });
    expect(result.success).toBe(true);
  });

  it("requires deal value", () => {
    const result = createDealSchema.safeParse({
      title: "",
      pipelineName: "Sales",
      stage: "Lead",
      valueMinor: -1,
    });
    expect(result.success).toBe(false);
  });
});
