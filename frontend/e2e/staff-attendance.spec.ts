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

test.describe("staff attendance smoke", () => {
  test("records clock-in event", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Clock School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/staff-attendance?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Staff clock-in", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Record clock event" });
    await form.getByLabel("Staff display name").fill("Sam Staff");
    await form.getByLabel("Event type").selectOption("clock_in");
    await form.getByLabel("Branch name").fill("Main Branch");
    await form.getByRole("button", { name: "Record clock event" }).click();
    await expect(page.getByText("Clock event recorded.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Sam Staff" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Clock in" })).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
