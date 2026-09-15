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

test.describe("bulk actions smoke", () => {
  test("runs small job and large delete job with approval", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Bulk School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/bulk-actions?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Bulk actions", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const smallForm = page.getByRole("form", { name: "Create bulk job" });
    await smallForm.getByLabel("Module").fill("students");
    await smallForm.getByLabel("Action").selectOption("tag");
    await smallForm.getByLabel("Item count").fill("3");
    await smallForm.getByRole("button", { name: "Create bulk job" }).click();
    await expect(page.getByText("Bulk job created.")).toBeVisible();
    await dismissFeedback(page);
    const smallRow = page.getByRole("row").filter({ hasText: "Tag" }).first();
    await smallRow.getByRole("button", { name: "Run" }).click();
    await expect(page.getByText("Bulk job completed.")).toBeVisible();
    await dismissFeedback(page);

    const largeForm = page.getByRole("form", { name: "Create bulk job" });
    await largeForm.getByLabel("Module").fill("students");
    await largeForm.getByLabel("Action").selectOption("delete");
    await largeForm.getByLabel("Item count").fill("12");
    await largeForm.getByRole("button", { name: "Create bulk job" }).click();
    await expect(
      page.getByText("Bulk job created and requires approval before running."),
    ).toBeVisible();
    await dismissFeedback(page);

    const largeRow = page
      .getByRole("row")
      .filter({ hasText: "Delete" })
      .filter({ hasText: "12" });
    await expect(
      largeRow.getByText(
        "This bulk job requires explicit approval before it can run.",
      ),
    ).toBeVisible();
    const runBtn = largeRow.getByRole("button", { name: "Run" });
    await expect(runBtn).toBeDisabled();
    await largeRow.getByLabel("Approval granted").check();
    await expect(runBtn).toBeEnabled();
    await runBtn.click();
    await expect(page.getByText("Bulk job completed.")).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
