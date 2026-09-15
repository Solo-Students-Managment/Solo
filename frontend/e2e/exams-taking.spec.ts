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

test.describe("exams taking smoke", () => {
  test("starts attempt, records signal, and submits", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Exam Taking School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/exams?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Exams", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const createForm = page.getByRole("form", { name: "Create exam" });
    await createForm.getByLabel("Title").fill("Timed Quiz");
    await createForm.getByLabel("Pool size").fill("8");
    await createForm.getByLabel("Max attempts").fill("2");
    await createForm.getByLabel("Time limit (minutes)").fill("30");
    await createForm.getByRole("button", { name: "Create exam" }).click();
    await expect(page.getByText("Timed Quiz")).toBeVisible();
    await dismissFeedback(page);
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Exam published.")).toBeVisible();
    await dismissFeedback(page);

    const startForm = page.getByRole("form", { name: "Start attempt" });
    await startForm.getByLabel("Exam title").fill("Timed Quiz");
    await startForm.getByLabel("Student name").fill("Sara");
    await startForm.getByRole("button", { name: "Start attempt" }).click();
    await expect(page.getByText(/Attempt started/)).toBeVisible();
    await dismissFeedback(page);

    const signalForm = page.getByRole("form", { name: "Record signal" });
    await signalForm.getByLabel("Signal").selectOption("tab_blur");
    await signalForm.getByRole("button", { name: "Record signal" }).click();
    await expect(page.getByText("Signal recorded.")).toBeVisible();
    await dismissFeedback(page);

    const submitForm = page.getByRole("form", { name: "Submit attempt" });
    await submitForm.getByRole("button", { name: "Submit attempt" }).click();
    await expect(page.getByText("Attempt submitted.")).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
