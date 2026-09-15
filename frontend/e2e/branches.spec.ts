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

test.describe("branches smoke", () => {
  test("creates branch, sets main, and archives previous main", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Branches School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/branches?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Branches", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Main Branch")).toBeVisible();

    const form = page.getByRole("form", { name: "Create branch" });
    await form.getByLabel("Branch name").fill("North Campus");
    await form.getByLabel("Code").fill("NORTH");
    await form.getByLabel("Effective from").fill("2026-09-01");
    await form.getByLabel("Address").fill("12 Oak St");
    await form.getByRole("button", { name: "Create branch" }).click();
    await expect(page.getByText("Branch created.")).toBeVisible();
    await dismissFeedback(page);

    await page
      .getByRole("row")
      .filter({ hasText: "North Campus" })
      .getByRole("button", { name: "Set as main" })
      .click();
    await expect(page.getByText("Main branch updated.")).toBeVisible();
    await dismissFeedback(page);

    await page
      .getByRole("row")
      .filter({ hasText: "Main Branch" })
      .getByRole("button", { name: "Archive" })
      .click();
    await expect(page.getByText("Branch archived.")).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
