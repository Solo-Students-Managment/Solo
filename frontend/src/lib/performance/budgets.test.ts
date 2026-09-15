import { describe, expect, it } from "vitest";

import { isWithinBudget } from "./budgets";

describe("performance budgets", () => {
  it("enforces route first-load budgets", () => {
    expect(isWithinBudget("/p/[slug]", 120)).toBe(true);
    expect(isWithinBudget("/p/[slug]", 400)).toBe(false);
  });
});
