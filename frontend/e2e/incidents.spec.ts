import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";
test.describe("incidents smoke", () => {
  test("creates and resolves incident", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/admin/incidents?lang=en");
    await expect(
      page.getByRole("heading", { name: "Incidents", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Create incident" }).click();
    await expect(
      page.getByRole("cell", { name: "investigating" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Mark resolved" }).click();
    await expect(page.getByRole("cell", { name: "resolved" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
