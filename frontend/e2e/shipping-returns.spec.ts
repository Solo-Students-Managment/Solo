import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("shipping returns smoke", () => {
  test("lists addresses and adds one", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/shipping?lang=en");
    await expect(
      page.getByRole("heading", { name: "Shipping & returns", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Home:")).toBeVisible();
    await page.getByRole("button", { name: "Add address" }).click();
    await expect(page.getByText("Office:")).toBeVisible({ timeout: 10_000 });
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
