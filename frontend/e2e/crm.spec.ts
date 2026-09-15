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

test.describe("crm smoke", () => {
  test("creates private pipeline and deal", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "CRM School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/crm?lang=en`);
    await expect(
      page.getByRole("heading", { name: "CRM", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const pipelineForm = page.getByRole("form", { name: "Create pipeline" });
    await pipelineForm.getByLabel("Pipeline name").fill("Admissions");
    await pipelineForm
      .getByLabel("Stage labels (comma-separated)")
      .fill("Lead, Qualified, Won");
    await pipelineForm.getByLabel("Private pipeline").check();
    await pipelineForm.getByRole("button", { name: "Create pipeline" }).click();
    await expect(page.getByText("Pipeline created.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Admissions" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Private", exact: true }),
    ).toBeVisible();
    await dismissFeedback(page);

    const dealForm = page.getByRole("form", { name: "Create deal" });
    await dealForm.getByLabel("Deal title").fill("Ali family enrollment");
    await dealForm.getByLabel("Pipeline name").fill("Admissions");
    await dealForm.getByLabel("Stage", { exact: true }).fill("Lead");
    await dealForm.getByLabel("Value (minor units)").fill("750000");
    await dealForm.getByRole("button", { name: "Create deal" }).click();
    await expect(page.getByText("Deal created.")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Ali family enrollment" }),
    ).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
