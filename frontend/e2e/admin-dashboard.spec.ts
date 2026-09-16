import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("admin dashboard smoke", () => {
  test("shows platform KPIs", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/admin?lang=en");
    await expect(
      page.getByRole("heading", { name: "Platform KPIs", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("platform-kpis")).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
