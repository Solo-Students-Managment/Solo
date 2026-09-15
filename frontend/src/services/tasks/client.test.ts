import { describe, expect, it } from "vitest";
import { canTransitionTaskStatus } from "./client";

describe("task status transitions", () => {
  it("allows start and complete paths and blocks invalid jumps", () => {
    expect(canTransitionTaskStatus("todo", "in_progress")).toBe(true);
    expect(canTransitionTaskStatus("in_progress", "done")).toBe(true);
    expect(canTransitionTaskStatus("todo", "done")).toBe(false);
    expect(canTransitionTaskStatus("done", "in_progress")).toBe(false);
    expect(canTransitionTaskStatus("blocked", "in_progress")).toBe(true);
  });
});
