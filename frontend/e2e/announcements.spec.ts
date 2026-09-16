import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";
test.describe("announcements smoke", () => {
  test("creates and publishes announcement", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/admin/announcements?lang=en");
    await expect(
      page.getByRole("heading", { name: "Announcements", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Create announcement" }).click();
    await expect(page.getByRole("cell", { name: "draft" })).toBeVisible();
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByRole("cell", { name: "published" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
