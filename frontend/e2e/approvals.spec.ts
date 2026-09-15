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

test.describe("approvals smoke", () => {
  test("creates request and blocks self-approval then approves", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Approvals School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/approvals?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Approval center", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Create approval request" });
    await form.getByLabel("Title").fill("Budget increase");
    await form.getByLabel("Requester display name").fill("Ada Requester");
    await form.getByLabel("Summary").fill("Need extra materials budget.");
    await form.getByRole("button", { name: "Create approval request" }).click();
    await expect(page.getByText("Approval request created.")).toBeVisible();
    await dismissFeedback(page);

    await page.getByLabel("Acting as").fill("Ada Requester");
    const row = page.getByRole("row").filter({ hasText: "Budget increase" });
    await row.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Self-approval is not allowed.")).toBeVisible();
    await dismissFeedback(page);

    await page.getByLabel("Acting as").fill("Sam Manager");
    await row.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Decision recorded.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Approved" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
