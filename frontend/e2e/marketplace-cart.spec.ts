import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("marketplace cart smoke", () => {
  test("lists grouped cart and checks out", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/cart?lang=en");
    await expect(
      page.getByRole("heading", { name: "Shopping cart", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Algebra Workbook")).toBeVisible();
    await expect(page.getByTestId("cart-total")).toContainText("610000");
    await page.getByRole("button", { name: "Checkout" }).click();
    await expect(page.getByText("Your cart is empty")).toBeVisible({
      timeout: 10_000,
    });
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
