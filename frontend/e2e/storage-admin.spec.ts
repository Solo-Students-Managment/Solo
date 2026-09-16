import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";
test.describe("storage admin smoke", () => {
  test("quarantines a file", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/admin/storage?lang=en");
    await expect(
      page.getByRole("heading", { name: "Storage admin", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("storage-quota")).toBeVisible();
    await page.getByRole("button", { name: "Quarantine" }).first().click();
    await expect(page.getByRole("cell", { name: "Quarantined" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
