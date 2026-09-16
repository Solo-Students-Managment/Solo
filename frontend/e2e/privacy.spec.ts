import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";
test.describe("privacy smoke", () => {
  test("submits and completes privacy request", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/admin/privacy?lang=en");
    await expect(
      page.getByRole("heading", { name: "Privacy requests", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Submit request" }).click();
    await expect(page.getByRole("cell", { name: "submitted" })).toBeVisible();
    await page.getByRole("button", { name: "Mark completed" }).click();
    await expect(page.getByRole("cell", { name: "completed" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
