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

test.describe("analytics smoke", () => {
  test("creates saved view and goal then meets goal", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Analytics School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/analytics?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Analytics", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const viewForm = page.getByRole("form", { name: "Create saved view" });
    await viewForm.getByLabel("View name").fill("Attendance watch");
    await viewForm.getByLabel("Metric key").fill("attendance_rate");
    await viewForm.getByLabel("Alert threshold").fill("85");
    await viewForm.getByRole("button", { name: "Create saved view" }).click();
    await expect(page.getByText("Saved view created.")).toBeVisible();
    await dismissFeedback(page);

    const goalForm = page.getByRole("form", { name: "Create goal" });
    await goalForm.getByLabel("Goal name").fill("New enrollments");
    await goalForm.getByLabel("Target value").fill("25");
    await goalForm.getByRole("button", { name: "Create goal" }).click();
    await expect(page.getByText("Goal created.")).toBeVisible();
    await dismissFeedback(page);

    const row = page.getByRole("row").filter({ hasText: "New enrollments" });
    await row.getByLabel("Current value").fill("25");
    await row.getByRole("button", { name: "Update progress" }).click();
    await expect(page.getByText("Goal progress updated.")).toBeVisible();
    await expect(
      row.getByRole("cell", { name: "Goal met", exact: true }),
    ).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
