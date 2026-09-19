import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";
test.describe("product variants smoke", () => {
  test("lists variant and decrements inventory", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/seller/variants?lang=en");
    await expect(
      page.getByRole("heading", { name: "Product variants", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("list", { name: "Variants" }).getByText("Paperback"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Use 1 unit" }).click();
    await expect(page.getByText("inv 9")).toBeVisible({ timeout: 10_000 });
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
