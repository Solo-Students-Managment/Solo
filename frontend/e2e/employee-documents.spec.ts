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

test.describe("employee documents smoke", () => {
  test("adds employee document metadata", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Docs School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/employee-documents?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Employee documents", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    const form = page.getByRole("form", { name: "Add document" });
    await form.getByLabel("Staff display name").fill("Sam Staff");
    await form.getByLabel("Document title").fill("National ID");
    await form.getByLabel("Category").fill("Identity");
    await form.getByRole("button", { name: "Add document" }).click();
    await expect(page.getByText("Document added.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "National ID" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
