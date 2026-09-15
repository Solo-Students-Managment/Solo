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

test.describe("policies smoke", () => {
  test("creates draft policy and publishes it", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Policies School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/policies?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Policy center", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Create draft policy" });
    await form.getByLabel("Title").fill("Attendance grace period");
    await form.getByLabel("Category").fill("attendance");
    await form.getByLabel("Summary").fill("Allow 10 minutes late before mark.");
    await form.getByRole("button", { name: "Create draft policy" }).click();
    await expect(page.getByText("Draft policy created.")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Attendance grace period" }),
    ).toBeVisible();
    await dismissFeedback(page);

    const row = page.getByRole("row").filter({
      hasText: "Attendance grace period",
    });
    await row.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Policy published.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Published" })).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
