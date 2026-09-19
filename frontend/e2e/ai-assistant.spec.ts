import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("ai assistant smoke", () => {
  test("teacher can start a role-specific thread", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/personal/ai?lang=en&persona=teacher");
    await expect(
      page.getByRole("heading", { name: "AI assistant", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("ai-persona")).toContainText("Teacher");
    await expect(page.getByText("Lesson outline")).toBeVisible();
    await page.getByRole("button", { name: "Start" }).first().click();
    await expect(page.getByTestId("ai-messages")).toContainText(
      "human review",
      { timeout: 15_000 },
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
