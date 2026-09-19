import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("marketplace orders smoke", () => {
  test("lists buyer orders and seller fulfills", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/orders?lang=en");
    await expect(
      page.getByRole("heading", { name: "My orders", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Algebra Workbook")).toBeVisible();
    await page.goto("/personal/seller/orders?lang=en");
    await expect(
      page.getByRole("heading", { name: "Seller orders", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Mark fulfilled" }).click();
    await expect(page.getByText("fulfilled")).toBeVisible({ timeout: 10_000 });
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
