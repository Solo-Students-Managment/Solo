import { expect, test } from "@playwright/test";
import {
  assertNoAuthSecretsInBrowserStorage,
  createOrganization,
  signIn,
} from "./helpers";

test.describe("billing center smoke", () => {
  test("shows invoices and next bill", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Billing School");
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/billing?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Billing center", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("cell", { name: "INV-1001" })).toBeVisible();
    await expect(page.getByText(/4242/)).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
