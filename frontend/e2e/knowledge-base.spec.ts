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

test.describe("knowledge base smoke", () => {
  test("creates reviews and publishes an article", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "KB School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/knowledge-base?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Knowledge base", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    const form = page.getByRole("form", { name: "Create article" });
    await form.getByLabel("Title").fill("Onboarding guide");
    await form.getByLabel("Space").fill("People Ops");
    await form.getByLabel("Tags").fill("onboarding");
    await form.locator(".ProseMirror").fill("Welcome checklist for teachers");
    await form.getByRole("button", { name: "Create article" }).click();
    await expect(page.getByText("Article draft created.")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Onboarding guide" }),
    ).toBeVisible();
    await dismissFeedback(page);
    const row = page.getByRole("row").filter({ hasText: "Onboarding guide" });
    await row.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText("Article status updated.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "In review" })).toBeVisible();
    await dismissFeedback(page);
    await row.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Article status updated.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Published" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
