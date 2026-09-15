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

test.describe("courses terms lifecycle smoke", () => {
  test("creates term, course, class, clone, continue, mid-course entry", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Terms Courses School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/courses?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Courses & classes", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const termForm = page.getByRole("form", { name: "Create term" });
    await termForm.getByLabel("Term name").fill("Fall 2026");
    await termForm.getByLabel("Starts on").fill("2026-09-01");
    await termForm.getByLabel("Ends on").fill("2026-12-20");
    await termForm.getByRole("button", { name: "Create term" }).click();
    await expect(
      page.getByText("Fall 2026 · 2026-09-01 → 2026-12-20"),
    ).toBeVisible();
    await dismissFeedback(page);

    const courseForm = page.getByRole("form", { name: "Create course" });
    await courseForm.getByLabel("Course name").fill("Algebra I");
    await courseForm.getByLabel("Subject name").fill("Mathematics");
    await courseForm.getByLabel("Term").selectOption({ label: "Fall 2026" });
    await courseForm.getByRole("button", { name: "Create course" }).click();
    await expect(
      page.getByRole("button", { name: "Algebra I Mathematics" }),
    ).toBeVisible();
    await dismissFeedback(page);

    const classForm = page.getByRole("form", { name: "Create class" });
    await classForm.getByLabel("Class name").fill("Section A");
    await classForm.getByLabel("Capacity").fill("20");
    await classForm.getByRole("button", { name: "Create class" }).click();
    await expect(page.getByText("Class created.")).toBeVisible();
    await dismissFeedback(page);

    await page
      .getByRole("row")
      .filter({ hasText: "Algebra I" })
      .getByRole("button", { name: "Clone course" })
      .click();
    await expect(
      page.getByText("Course cloned without history."),
    ).toBeVisible();
    await dismissFeedback(page);

    await page
      .getByRole("button", { name: "Algebra I Mathematics" })
      .first()
      .click();
    await page
      .getByRole("row")
      .filter({ hasText: "Section A" })
      .getByRole("button", { name: "Continue" })
      .first()
      .click();
    await expect(page.getByText("Class continuation created.")).toBeVisible();
    await dismissFeedback(page);

    await page
      .getByRole("row")
      .filter({ hasText: "Section A" })
      .getByRole("button", { name: "Mid-course entry" })
      .first()
      .click();
    await expect(page.getByText("Mid-course entry enabled.")).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
