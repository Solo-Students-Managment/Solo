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

test.describe("data ops smoke", () => {
  test("creates export job and advances to completed", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Data Ops School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/data-ops?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Data operations", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Create data job" });
    await form.getByLabel("Job type").selectOption("export");
    await form.getByLabel("Resource key").fill("students.csv");
    await form.getByRole("button", { name: "Create data job" }).click();
    await expect(page.getByText("Data job queued.")).toBeVisible();
    await dismissFeedback(page);

    const row = page.getByRole("row").filter({ hasText: "students.csv" });
    await row.getByRole("button", { name: "Advance" }).click();
    await expect(page.getByText("Job status advanced.")).toBeVisible();
    await expect(
      row.getByRole("cell", { name: "Running", exact: true }),
    ).toBeVisible();
    await dismissFeedback(page);
    await row.getByRole("button", { name: "Advance" }).click();
    await expect(page.getByText("Job status advanced.")).toBeVisible();
    await expect(
      row.getByRole("cell", { name: "Completed", exact: true }),
    ).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
