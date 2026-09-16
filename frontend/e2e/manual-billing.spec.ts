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

test.describe("manual billing smoke", () => {
  test("creates sends and pays invoice", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Manual Billing School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/manual-billing?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Manual billing", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Create invoice" }).click();
    await expect(page.getByRole("cell", { name: "Draft" })).toBeVisible();
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("cell", { name: "Sent" })).toBeVisible();
    await page.getByRole("button", { name: "Mark paid" }).click();
    await expect(page.getByRole("cell", { name: "Paid" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
