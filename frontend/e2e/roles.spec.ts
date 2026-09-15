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

test.describe("roles smoke", () => {
  test("lists system templates and creates custom role", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Roles School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/roles?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Roles & permissions", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("cell", { name: "Owner (System)", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Teacher (System)", exact: true }),
    ).toBeVisible();

    const form = page.getByRole("form", { name: "Create custom role" });
    await form.getByLabel("Role name").fill("Lab Assistant");
    await form.getByLabel("Template").selectOption("custom");
    await form
      .getByLabel("Permissions (comma or line separated)")
      .fill("sessions.view, facilities.view");
    await form.getByRole("button", { name: "Create custom role" }).click();
    await expect(page.getByText("Role created.")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Lab Assistant" }),
    ).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
