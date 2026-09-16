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
test.describe("org lifecycle smoke", () => {
  test("archives organization with impact preview", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Lifecycle School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/lifecycle?lang=en`);
    await expect(
      page.getByRole("heading", {
        name: "Organization lifecycle",
        exact: true,
      }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("lifecycle-impact")).toBeVisible();
    await page.getByRole("button", { name: "Archive organization" }).click();
    await expect(page.getByTestId("lifecycle-state")).toContainText("archived");
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
