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

test.describe("evaluations smoke", () => {
  test("creates scale, level, metric, and template", async ({ page }) => {
    await signIn(page);
    await createOrganization(page, "Evaluations School");
    await dismissFeedback(page);
    await page.getByRole("link", { name: "Evaluations" }).first().click();
    await expect(
      page.getByRole("heading", { name: "Evaluations" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Grade scales" }).click();
    const scaleForm = page.getByRole("form", { name: "Create scale" });
    await expect(scaleForm).toBeVisible();
    await scaleForm.getByLabel("Name").fill("Standard 100");
    await scaleForm.getByLabel("Scale type").selectOption("out_of_100");
    await scaleForm.getByRole("button", { name: "Create scale" }).click();
    await expect(page.getByText("Standard 100")).toBeVisible();
    await dismissFeedback(page);

    await page.getByRole("link", { name: "Levels" }).click();
    const levelForm = page.getByRole("form", { name: "Create level" });
    await expect(levelForm).toBeVisible();
    await levelForm.getByLabel("Name").fill("Intermediate");
    await levelForm.getByLabel("Rank").fill("2");
    await levelForm.getByRole("button", { name: "Create level" }).click();
    await expect(page.getByText("Intermediate")).toBeVisible();
    await dismissFeedback(page);

    await page.getByRole("link", { name: "Progress" }).click();
    const metricForm = page.getByRole("form", { name: "Create metric" });
    await expect(metricForm).toBeVisible();
    await metricForm.getByLabel("Name").fill("Attendance rate");
    await metricForm.getByLabel("Kind").selectOption("core");
    await metricForm.getByLabel("Unit").fill("%");
    await metricForm.getByRole("button", { name: "Create metric" }).click();
    await expect(page.getByText("Attendance rate")).toBeVisible();
    await dismissFeedback(page);

    await page.getByRole("link", { name: "Templates" }).click();
    const templateForm = page.getByRole("form", { name: "Create template" });
    await expect(templateForm).toBeVisible();
    await templateForm.getByLabel("Name").fill("Math formative");
    await templateForm.getByLabel("Domain").fill("Mathematics");
    await templateForm
      .getByLabel("Grade scale")
      .selectOption({ label: "Standard 100 (/100)" });
    await templateForm.getByRole("button", { name: "Create template" }).click();
    await expect(page.getByText("Math formative")).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
