import { expect, test, type Page } from "@playwright/test";

import {
  assertNoAuthSecretsInBrowserStorage,
  createOrganization,
  signIn,
} from "./helpers";

async function dismissFeedback(page: Page) {
  const dismiss = page.getByRole("button", { name: "Dismiss" });
  while ((await dismiss.count()) > 0) {
    await dismiss.first().click();
  }
}

test.describe("onboarding smoke", () => {
  test("starts and advances onboarding", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Onboard School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/onboarding?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Staff onboarding", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Start onboarding" });
    await form.getByLabel("Staff display name").fill("New Teacher");
    await form.getByLabel("Role template").fill("teacher");
    await form.getByRole("button", { name: "Start onboarding" }).click();
    await expect(page.getByText("Onboarding started.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "New Teacher" })).toBeVisible();
    await dismissFeedback(page);

    const row = page.getByRole("row").filter({ hasText: "New Teacher" });
    await row.getByRole("button", { name: "Advance step" }).click();
    await expect(page.getByText("Onboarding step advanced.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Documents" })).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
