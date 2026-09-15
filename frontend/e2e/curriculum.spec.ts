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

test.describe("curriculum smoke", () => {
  test("creates module, unit, and lesson hierarchy", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Curriculum School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/curriculum?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Curriculum", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const moduleForm = page.getByRole("form", { name: "Create module" });
    await moduleForm.getByLabel("Title").fill("Foundations");
    await moduleForm.getByLabel("Sort order").fill("1");
    await moduleForm.getByRole("button", { name: "Create module" }).click();
    await expect(page.getByText("Foundations")).toBeVisible();
    await dismissFeedback(page);

    await page.getByRole("link", { name: "Units" }).click();
    const unitForm = page.getByRole("form", { name: "Create unit" });
    await expect(unitForm).toBeVisible();
    await unitForm.getByLabel("Module").selectOption({ label: "Foundations" });
    await unitForm.getByLabel("Title").fill("Algebra basics");
    await unitForm.getByLabel("Sort order").fill("1");
    await unitForm.getByRole("button", { name: "Create unit" }).click();
    await expect(page.getByText("Algebra basics")).toBeVisible();
    await dismissFeedback(page);

    await page.getByRole("link", { name: "Lessons" }).click();
    const lessonForm = page.getByRole("form", { name: "Create lesson" });
    await expect(lessonForm).toBeVisible();
    await lessonForm
      .getByLabel("Unit")
      .selectOption({ label: "Algebra basics" });
    await lessonForm.getByLabel("Title").fill("Linear equations");
    await lessonForm.getByLabel("Kind").selectOption("Lesson");
    await lessonForm
      .getByLabel("Objectives")
      .fill("Solve one-variable equations");
    await lessonForm.getByLabel("Duration (minutes)").fill("50");
    await lessonForm.getByLabel("Progress %").fill("0");
    await lessonForm.getByRole("button", { name: "Create lesson" }).click();
    await expect(page.getByText("Linear equations")).toBeVisible();
    await expect(page.getByText("Lesson created.")).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
