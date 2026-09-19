import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("marketplace taxonomy smoke", () => {
  test("lists taxonomy and adds price history", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/seller/taxonomy?lang=en");
    await expect(
      page.getByRole("heading", { name: "Product taxonomy", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Textbooks")).toBeVisible();
    await page.getByRole("button", { name: "Add price entry" }).click();
    await expect(page.getByTestId("price-history")).toContainText("EUR", {
      timeout: 10_000,
    });
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
