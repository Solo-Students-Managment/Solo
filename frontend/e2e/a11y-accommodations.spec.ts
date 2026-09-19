import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";
test.describe("a11y-accommodations smoke", () => {
  test("happy path", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/accessibility?lang=en");
    await expect(
      page.getByRole("heading", {
        name: "Accessibility accommodations",
        exact: true,
      }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("a11y-accommodations-list")).toBeVisible();
    await page.getByRole("button", { name: "Mark pass" }).first().click();
    await expect(page.getByTestId("a11y-accommodations-passed")).toContainText(
      /[12]/,
      { timeout: 15_000 },
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
