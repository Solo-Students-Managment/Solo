import { expect, test } from "@playwright/test";
import {
  assertNoAuthSecretsInBrowserStorage,
  createOrganization,
  signIn,
} from "./helpers";

test.describe("organization subscription smoke", () => {
  test("shows trial subscription state", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Sub School");
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/subscription?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Subscription", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Trial", { exact: true })).toBeVisible();
    await expect(page.getByText("14")).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
