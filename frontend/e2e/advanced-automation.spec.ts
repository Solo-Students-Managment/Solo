import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";
test.describe("advanced-automation smoke", () => {
  test("happy path", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/advanced-automation?lang=en");
    await expect(
      page.getByRole("heading", { name: "Advanced automation", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("advanced-automation-list")).toBeVisible();
    await page.getByRole("button", { name: "Mark pass" }).first().click();
    await expect(page.getByTestId("advanced-automation-passed")).toContainText(
      /[12]/,
      { timeout: 15_000 },
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
