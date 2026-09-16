import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";
test.describe("feature flags smoke", () => {
  test("toggles a feature flag", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/admin/feature-flags?lang=en");
    await expect(
      page.getByRole("heading", { name: "Feature flags", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    const btn = page.getByRole("button", { name: /Enable|Disable/ }).first();
    const before = await btn.textContent();
    await btn.click();
    await expect(
      page
        .getByRole("button", {
          name: before?.includes("Enable") ? "Disable" : "Enable",
        })
        .first(),
    ).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
