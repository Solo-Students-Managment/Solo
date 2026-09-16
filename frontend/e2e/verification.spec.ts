import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("verification smoke", () => {
  test("approves a verification request", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/admin/verification?lang=en");
    await expect(
      page.getByRole("heading", { name: "Verification center", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Approve" }).first().click();
    await expect(page.getByRole("cell", { name: "approved" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
