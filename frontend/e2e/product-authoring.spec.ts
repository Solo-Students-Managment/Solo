import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("product authoring smoke", () => {
  test("seller can publish a draft product", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/seller/products?lang=en");
    await expect(
      page.getByRole("heading", { name: "Product authoring", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page
        .getByRole("list", { name: "Your products" })
        .getByText("Algebra workbook"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Product published.")).toBeVisible({
      timeout: 15_000,
    });
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
