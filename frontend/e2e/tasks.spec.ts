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

test.describe("tasks smoke", () => {
  test("creates and completes a task", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Tasks School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/tasks?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Task management", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    const form = page.getByRole("form", { name: "Create task" });
    await form.getByLabel("Title").fill("Prep classroom");
    await form.getByLabel("Description").fill("Set up boards and materials");
    await form.getByLabel("Assignee display name").fill("Sara Teacher");
    await form.getByLabel("Department").fill("Academics");
    await form.getByLabel("Due date").fill("2026-09-20");
    await form.getByRole("button", { name: "Create task" }).click();
    await expect(page.getByText("Task created.")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Prep classroom" }),
    ).toBeVisible();
    await dismissFeedback(page);
    const row = page.getByRole("row").filter({ hasText: "Prep classroom" });
    await row.getByRole("button", { name: "Start" }).click();
    await expect(page.getByText("Task status updated.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "In progress" })).toBeVisible();
    await dismissFeedback(page);
    await row.getByRole("button", { name: "Complete" }).click();
    await expect(page.getByText("Task status updated.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Done" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
