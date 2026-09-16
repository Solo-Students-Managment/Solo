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

test.describe("plan change smoke", () => {
  test("previews downgrade over-limit impact", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Plan Change School");
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/plan-change?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Plan change", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/no data will be deleted/i)).toBeVisible();
    await page.getByLabel("Target plan").selectOption("org_starter");
    await page.getByRole("button", { name: "Preview impact" }).click();
    await expect(page.getByText("Over-limit after change")).toBeVisible();
    await page.getByRole("button", { name: "Apply change" }).click();
    await expect(page.getByText("Plan change applied.")).toBeVisible();
    await dismissFeedback(page);
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
