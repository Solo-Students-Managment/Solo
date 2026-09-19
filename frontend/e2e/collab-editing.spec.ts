import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";
test.describe("collab-editing smoke", () => {
  test("happy path", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/collab?lang=en");
    await expect(
      page.getByRole("heading", { name: "Collaborative editing", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("collab-editing-list")).toBeVisible();
    await page.getByRole("button", { name: "Mark pass" }).first().click();
    await expect(page.getByTestId("collab-editing-passed")).toContainText(
      /[12]/,
      { timeout: 15_000 },
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
