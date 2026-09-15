import { expect, test } from "@playwright/test";

/**
 * Opt-in visual regression. Run with:
 *   pnpm test:visual
 * Update baselines with:
 *   pnpm test:visual --update-snapshots
 */
test.describe("visual regression smoke @visual", () => {
  test("home first viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("home-first-viewport.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });
});
