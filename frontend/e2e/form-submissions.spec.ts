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

test.describe("form submissions smoke", () => {
  test("comments and approves a public submission", async ({ page }) => {
    test.setTimeout(120_000);
    await signIn(page);
    await createOrganization(page, "Form Review School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/forms?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Forms & surveys", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    const form = page.getByRole("form", { name: "Create form" });
    await form.getByLabel("Title").fill("Term survey");
    await form.getByLabel("Description").fill("End of term");
    await form.getByLabel("Question").fill("Any feedback?");
    await form.getByLabel("Public slug").fill("term-survey");
    await form.getByRole("button", { name: "Create form" }).click();
    await expect(page.getByText("Form draft created.")).toBeVisible();
    await dismissFeedback(page);
    await page
      .getByRole("row")
      .filter({ hasText: "Term survey" })
      .getByRole("button", { name: "Publish" })
      .click();
    await expect(page.getByText("Form published.")).toBeVisible();
    await dismissFeedback(page);

    await page.goto(`/f/term-survey?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Term survey", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    const publicForm = page.getByRole("form", { name: "Submit response" });
    await publicForm.getByLabel("Any feedback?").fill("Need more practice");
    await publicForm.getByLabel("Full name for consent").fill("Sam Parent");
    await publicForm.getByLabel(/I consent to submitting/).check();
    await publicForm.getByRole("button", { name: "Submit response" }).click();
    await expect(page.getByText("Response submitted.")).toBeVisible();
    await dismissFeedback(page);

    await page.goto(`/org/${orgId}/form-submissions?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Form submissions", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("cell", { name: "Need more practice" }),
    ).toBeVisible();
    const row = page.getByRole("row").filter({ hasText: "Sam Parent" });
    await row.getByLabel("Internal comment").fill("Follow up next week");
    await row.getByRole("button", { name: "Save comment" }).click();
    await expect(page.getByText("Internal comment saved.")).toBeVisible();
    await dismissFeedback(page);
    await row.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Review decision recorded.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Approved" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
