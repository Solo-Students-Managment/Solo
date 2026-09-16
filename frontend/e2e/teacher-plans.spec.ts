import { expect, test, type Page } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

async function dismissFeedback(page: Page) {
  const dismiss = page.getByRole("button", { name: "Dismiss" });
  while ((await dismiss.count()) > 0) await dismiss.first().click();
}

test.describe("teacher plans trial smoke", () => {
  test("starts Pro trial from teacher plans", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/teacher/plans?lang=en");
    await expect(
      page.getByRole("heading", { name: "Teacher plans", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/demo Price Book values/i)).toBeVisible();
    const proRow = page.getByRole("row", { name: /Teacher Pro/i });
    await proRow.getByRole("button", { name: "Start trial" }).click();
    await expect(page.getByText("Trial started.")).toBeVisible({
      timeout: 10_000,
    });
    await dismissFeedback(page);
    await expect(page.getByText("14")).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
