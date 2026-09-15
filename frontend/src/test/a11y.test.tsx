import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

import { formatAxeViolations, runAxe } from "./a11y";

describe("a11y harness", () => {
  it("reports no serious axe violations for Button", async () => {
    const { container } = render(<Button>Save</Button>);
    const results = await runAxe(container);
    expect(formatAxeViolations(results), formatAxeViolations(results)).toBe("");
    expect(results.violations).toHaveLength(0);
  });
});
