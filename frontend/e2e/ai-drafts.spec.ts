import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";
test.describe("ai drafts smoke", () => {
  test("creates and approves a draft", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/ai/drafts?lang=en");
    await expect(
      page.getByRole("heading", { name: "AI drafts", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Create draft" }).click();
    await expect(page.getByText("Draft created.")).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "Approve" }).first().click();
    await expect(page.getByText("approved").first()).toBeVisible({
      timeout: 15_000,
    });
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
