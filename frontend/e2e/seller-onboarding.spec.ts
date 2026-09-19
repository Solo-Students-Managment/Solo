import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("seller onboarding smoke", () => {
  test("signed-in user can submit seller application", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/seller?lang=en");
    await expect(
      page.getByRole("heading", { name: "Seller onboarding", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("seller-status")).toContainText(
      "Not started",
    );
    await page.getByLabel("Shop display name").fill("Book Shop");
    await page.getByLabel("Shop slug", { exact: true }).fill("book-shop");
    await page.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText("Seller application submitted.")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("seller-status")).toContainText(
      "Pending review",
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
