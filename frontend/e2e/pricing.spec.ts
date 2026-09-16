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

test.describe("pricing catalog smoke", () => {
  test("switches markets and compares plans", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Pricing School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/pricing?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Pricing catalog", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/demo Price Book values/i)).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Organization Pro" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: /IRR/ })).toBeVisible();
    await page.getByLabel("Market").selectOption("GLOBAL");
    await expect(page.getByRole("cell", { name: /\$/ })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
