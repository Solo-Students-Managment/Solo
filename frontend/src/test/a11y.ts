import axe, { type AxeResults } from "axe-core";

export async function runAxe(container: Element): Promise<AxeResults> {
  return axe.run(container, {
    rules: {
      // Color contrast is verified in design-system/manual QA for CSS-var themes.
      "color-contrast": { enabled: false },
    },
  });
}

export function formatAxeViolations(results: AxeResults): string {
  return results.violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `  - ${node.target.join(" ")}: ${node.failureSummary}`)
        .join("\n");
      return `${violation.id} (${violation.impact}): ${violation.help}\n${nodes}`;
    })
    .join("\n\n");
}
