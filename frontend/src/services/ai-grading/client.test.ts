import { describe, expect, it } from "vitest";
import {
  createMockAiGradingClient,
  isHeuristicOnly,
  requiresHumanApproval,
} from "./client";
describe("ai grading", () => {
  it("requires human approval and treats similarity as heuristic", async () => {
    const c = createMockAiGradingClient();
    const [s] = await c.list();
    expect(requiresHumanApproval(s!)).toBe(true);
    expect(isHeuristicOnly(s!.similarityScore)).toBe(true);
    expect((await c.approve(s!.id)).status).toBe("approved");
  });
});
