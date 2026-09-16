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

test.describe("tax invoices smoke", () => {
  test("issues a VAT invoice", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Tax School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/tax-invoices?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Tax & invoices", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    const form = page.getByRole("form", { name: "Issue document" });
    await form.getByRole("button", { name: "Issue document" }).click();
    await expect(page.getByText("Tax document issued.")).toBeVisible();
    await expect(page.getByRole("cell", { name: /TX-/ })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
