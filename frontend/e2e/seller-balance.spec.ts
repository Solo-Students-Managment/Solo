import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("seller balance smoke", () => {
  test("shows balance and requests payout", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/seller/balance?lang=en");
    await expect(
      page.getByRole("heading", { name: "Seller balance", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("balance-available")).toContainText(
      "1200000",
    );
    await page.getByRole("button", { name: "Request payout" }).click();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
