import { describe, expect, it } from "vitest";
import { selectFieldHasOptions } from "./client";

describe("customization helpers", () => {
  it("requires options for select fields", () => {
    expect(selectFieldHasOptions("text", "")).toBe(true);
    expect(selectFieldHasOptions("select", "")).toBe(false);
    expect(selectFieldHasOptions("select", "a, b")).toBe(true);
  });
});
