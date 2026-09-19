import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("wallet smoke", () => {
  test("shows balance and applies credit", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/wallet?lang=en");
    await expect(
      page.getByRole("heading", { name: "Wallet", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("wallet-balance")).toContainText("500000");
    await page
      .getByRole("button", { name: "Apply credit at checkout" })
      .click();
    await expect(page.getByTestId("wallet-balance")).toContainText("450000", {
      timeout: 10_000,
    });
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
