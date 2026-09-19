import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("seller analytics smoke", () => {
  test("shows metrics and restrictions", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/seller/analytics?lang=en");
    await expect(
      page.getByRole("heading", { name: "Seller analytics", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("seller-metrics")).toContainText("42");
    await expect(page.getByTestId("seller-restrictions")).toContainText(
      "listing_limit",
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
