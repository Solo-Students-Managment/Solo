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

test.describe("departments smoke", () => {
  test("creates department and team", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Departments School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/departments?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Departments & teams", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const deptForm = page.getByRole("form", { name: "Create department" });
    await deptForm.getByLabel("Department name").fill("Academics");
    await deptForm.getByLabel("Code").fill("ACAD");
    await deptForm.getByRole("button", { name: "Create department" }).click();
    await expect(page.getByText("Department created.")).toBeVisible();
    await expect(page.getByText("Academics")).toBeVisible();
    await dismissFeedback(page);

    await page.getByRole("link", { name: "Teams", exact: true }).click();
    const teamForm = page.getByRole("form", { name: "Create team" });
    await expect(teamForm).toBeVisible();
    await teamForm
      .getByLabel("Department")
      .selectOption({ label: "Academics" });
    await teamForm.getByLabel("Team name").fill("Curriculum Leads");
    await teamForm.getByLabel("Team code").fill("CURR");
    await teamForm.getByRole("button", { name: "Create team" }).click();
    await expect(page.getByText("Team created.")).toBeVisible();
    await expect(page.getByText("Curriculum Leads")).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
