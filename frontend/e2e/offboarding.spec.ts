import { expect, test, type Page } from "@playwright/test";
import {
  assertNoAuthSecretsInBrowserStorage,
  createOrganization,
  signIn,
} from "./helpers";

async function dismissFeedback(page: Page) {
  const dismiss = page.getByRole("button", { name: "Dismiss" });
  while ((await dismiss.count()) > 0) await dismiss.first().click();
}

test.describe("offboarding smoke", () => {
  test("starts and advances offboarding", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Offboard School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/offboarding?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Staff offboarding", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    const form = page.getByRole("form", { name: "Start offboarding" });
    await form.getByLabel("Staff display name").fill("Leaving Teacher");
    await form.getByRole("button", { name: "Start offboarding" }).click();
    await expect(page.getByText("Offboarding started.")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Leaving Teacher" }),
    ).toBeVisible();
    await dismissFeedback(page);
    const row = page.getByRole("row").filter({ hasText: "Leaving Teacher" });
    await row.getByRole("button", { name: "Advance step" }).click();
    await expect(page.getByText("Offboarding step advanced.")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Asset return" }),
    ).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
