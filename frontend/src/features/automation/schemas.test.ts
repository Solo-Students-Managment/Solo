import { describe, expect, it } from "vitest";
import { createAutomationSchema } from "./schemas";

describe("createAutomationSchema", () => {
  it("requires name and steps summary", () => {
    const result = createAutomationSchema.safeParse({
      name: "",
      triggerType: "webhook",
      riskLevel: "low",
      stepsSummary: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid automation input", () => {
    const result = createAutomationSchema.safeParse({
      name: "Webhook sync",
      triggerType: "webhook",
      riskLevel: "medium",
      stepsSummary: "POST payload to CRM",
    });
    expect(result.success).toBe(true);
  });
});
