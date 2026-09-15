import { describe, expect, it } from "vitest";
import { isDocumentExpired } from "./client";
describe("employee documents helpers", () => {
  it("detects expired status", () => {
    expect(isDocumentExpired("expired")).toBe(true);
    expect(isDocumentExpired("active")).toBe(false);
  });
});
