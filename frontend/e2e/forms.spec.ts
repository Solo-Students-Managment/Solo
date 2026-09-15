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

test.describe("forms smoke", () => {
  test("publishes and submits a public form with consent", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Forms School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/forms?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Forms & surveys", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    const form = page.getByRole("form", { name: "Create form" });
    await form.getByLabel("Title").fill("Parent feedback");
    await form.getByLabel("Description").fill("Short term feedback");
    await form.getByLabel("Question").fill("How was this term?");
    await form.getByLabel("Public slug").fill("parent-feedback");
    await form.getByRole("button", { name: "Create form" }).click();
    await expect(page.getByText("Form draft created.")).toBeVisible();
    await dismissFeedback(page);
    const row = page.getByRole("row").filter({ hasText: "Parent feedback" });
    await row.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Form published.")).toBeVisible();
    await dismissFeedback(page);
    await page.goto(`/f/parent-feedback?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Parent feedback", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    const publicForm = page.getByRole("form", { name: "Submit response" });
    await publicForm.getByLabel("How was this term?").fill("Excellent support");
    await publicForm.getByLabel("Full name for consent").fill("Ada Parent");
    await publicForm.getByLabel(/I consent to submitting/).check();
    await publicForm.getByRole("button", { name: "Submit response" }).click();
    await expect(page.getByText("Response submitted.")).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
