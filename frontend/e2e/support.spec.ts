import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("support smoke", () => {
  test("opens ticket and enters support mode", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/admin/support?lang=en");
    await expect(
      page.getByRole("heading", { name: "Support tickets", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Open ticket" }).click();
    await expect(
      page.getByRole("cell", { name: "Billing help" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Enter support mode" }).click();
    await expect(page.getByTestId("support-mode")).toHaveText(
      "Support mode active",
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
