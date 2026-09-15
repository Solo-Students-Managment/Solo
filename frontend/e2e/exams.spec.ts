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

test.describe("exams builder smoke", () => {
  test("creates and publishes an exam with policies", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Exams School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/exams?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Exams", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Create exam" });
    await form.getByLabel("Title").fill("Midterm A");
    await form.getByLabel("Pool size").fill("15");
    await form.getByLabel("Randomize questions").selectOption("yes");
    await form.getByLabel("Max attempts").fill("2");
    await form.getByLabel("Time limit (minutes)").fill("45");
    await form.getByRole("button", { name: "Create exam" }).click();
    await expect(page.getByText("Midterm A")).toBeVisible();
    await dismissFeedback(page);

    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Exam published.")).toBeVisible();
    await expect(page.getByText("Published").first()).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
