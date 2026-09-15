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

test.describe("leave smoke", () => {
  test("requests and approves leave", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Leave School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/leave?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Staff leave", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Request leave" });
    await form.getByLabel("Staff display name").fill("Sam Staff");
    await form.getByLabel("Leave type").selectOption("annual");
    await form.getByLabel("Reason").fill("Family travel");
    await form.getByRole("button", { name: "Request leave" }).click();
    await expect(page.getByText("Leave request created.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Sam Staff" })).toBeVisible();
    await dismissFeedback(page);

    const row = page.getByRole("row").filter({ hasText: "Sam Staff" });
    await row.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Leave approved.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Approved" })).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
