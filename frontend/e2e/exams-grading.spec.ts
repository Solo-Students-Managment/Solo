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

test.describe("exam grading smoke", () => {
  test("grades attempt with placement and regrades with history", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Exam Grading School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/exams?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Exams", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const createForm = page.getByRole("form", { name: "Create exam" });
    await createForm.getByLabel("Title").fill("Placement Exam");
    await createForm.getByLabel("Pool size").fill("5");
    await createForm.getByLabel("Max attempts").fill("2");
    await createForm.getByRole("button", { name: "Create exam" }).click();
    await expect(page.getByText("Placement Exam")).toBeVisible();
    await dismissFeedback(page);
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Exam published.")).toBeVisible();
    await dismissFeedback(page);

    const startForm = page.getByRole("form", { name: "Start attempt" });
    await startForm.getByLabel("Exam title").fill("Placement Exam");
    await startForm.getByLabel("Student name").fill("Neda");
    await startForm.getByRole("button", { name: "Start attempt" }).click();
    await expect(page.getByText(/Attempt started/)).toBeVisible();
    await dismissFeedback(page);

    const submitForm = page.getByRole("form", { name: "Submit attempt" });
    await submitForm.getByRole("button", { name: "Submit attempt" }).click();
    await expect(page.getByText("Attempt submitted.")).toBeVisible();
    await dismissFeedback(page);

    await expect(
      page.getByRole("heading", { name: "Grade attempt", exact: true }),
    ).toBeVisible();

    const gradeForm = page.getByRole("form", { name: "Save grade" });
    await gradeForm.getByLabel("Score").fill("90");
    await gradeForm.getByLabel("Rubric notes").fill("Strong performance");
    await gradeForm.getByRole("button", { name: "Save grade" }).click();
    await expect(page.getByText("Grade saved.")).toBeVisible();
    await expect(page.getByText("advanced")).toBeVisible();
    await dismissFeedback(page);

    const attemptId = await gradeForm.getByLabel("Attempt id").inputValue();
    expect(attemptId.length).toBeGreaterThan(0);
    const gradeId = await page
      .getByRole("table")
      .getByText(/^exg_/)
      .first()
      .innerText();

    const regradeForm = page.getByRole("form", { name: "Save regrade" });
    await regradeForm.getByLabel("Grade id").fill(gradeId);
    await regradeForm.getByLabel("Attempt id").fill(attemptId);
    await regradeForm.getByLabel("Score").fill("78");
    await regradeForm.getByLabel("Rubric notes").fill("Adjusted after review");
    await regradeForm
      .getByLabel("Placement recommendation")
      .fill("intermediate");
    await regradeForm.getByLabel("Human override").selectOption("Yes");
    await regradeForm.getByRole("button", { name: "Save regrade" }).click();
    await expect(page.getByText("Regrade saved.")).toBeVisible();
    await expect(page.getByText("intermediate")).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Grade attempt" }).getByRole("table"),
    ).toContainText("2");

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
