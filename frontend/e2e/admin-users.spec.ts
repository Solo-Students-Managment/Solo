import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("admin users smoke", () => {
  test("restricts a user account", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/admin/users?lang=en");
    await expect(
      page.getByRole("heading", { name: "User management", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Restrict" }).first().click();
    await expect(page.getByRole("cell", { name: "Restricted" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
