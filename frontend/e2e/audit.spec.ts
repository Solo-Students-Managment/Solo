import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("audit smoke", () => {
  test("shows immutable audit log", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/admin/audit?lang=en");
    await expect(
      page.getByRole("heading", { name: "Audit log", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("cell", { name: "user.restrict" }),
    ).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
