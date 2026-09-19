import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("marketplace promos smoke", () => {
  test("applies coupon and shows affiliate code", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/promos?lang=en");
    await expect(
      page.getByRole("heading", { name: "Promos & wishlist", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("affiliate-code")).toContainText(
      "AFF-SARA-2026",
    );
    await page.getByRole("button", { name: "Apply coupon" }).click();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
