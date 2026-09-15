import { describe, expect, it } from "vitest";
import { canTransitionKbStatus, hasMeaningfulKbBody } from "./client";

describe("knowledge base helpers", () => {
  it("detects meaningful body content", () => {
    expect(hasMeaningfulKbBody("<p></p>")).toBe(false);
    expect(hasMeaningfulKbBody("<p>Onboarding guide</p>")).toBe(true);
  });

  it("enforces review before publish", () => {
    expect(canTransitionKbStatus("draft", "in_review")).toBe(true);
    expect(canTransitionKbStatus("draft", "published")).toBe(false);
    expect(canTransitionKbStatus("in_review", "published")).toBe(true);
  });
});
