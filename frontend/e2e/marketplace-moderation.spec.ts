import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("marketplace moderation smoke", () => {
  test("approves pending queue item", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/admin/marketplace-moderation?lang=en");
    await expect(
      page.getByRole("heading", {
        name: "Marketplace moderation",
        exact: true,
      }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Advanced Chemistry Kit")).toBeVisible();
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByTestId("mod-status-mod_1")).toContainText(
      "approved",
      { timeout: 15_000 },
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
