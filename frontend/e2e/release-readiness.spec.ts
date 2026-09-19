import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";
test.describe("release-readiness smoke", () => {
  test("happy path", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/release-readiness?lang=en");
    await expect(
      page.getByRole("heading", { name: "Release readiness", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("release-readiness-list")).toBeVisible();
    await page.getByRole("button", { name: "Mark pass" }).first().click();
    await expect(page.getByTestId("release-readiness-passed")).toContainText(
      /[12]/,
      { timeout: 15_000 },
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
