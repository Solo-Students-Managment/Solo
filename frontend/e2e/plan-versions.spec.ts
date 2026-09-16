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

test.describe("plan versions smoke", () => {
  test("starts migration and enrolls", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Plan Versions School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/plan-versions?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Plan versions", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Start migration" }).click();
    await expect(page.getByText("running")).toBeVisible();
    await page.getByRole("button", { name: "Enroll now" }).click();
    await expect(page.getByText("completed")).toBeVisible();
    await expect(page.getByTestId("current-plan-version")).toContainText("v2");
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
