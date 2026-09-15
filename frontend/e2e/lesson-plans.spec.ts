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

test.describe("lesson plans smoke", () => {
  test("creates, clones, and snapshots a lesson plan", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Lesson Plans School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/lesson-plans?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Lesson plans", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Create lesson plan" });
    await form.getByLabel("Title").fill("Warm-up algebra");
    await form.locator(".ProseMirror").fill("Solve two practice equations");
    await form.getByLabel("Sharing").selectOption("School");
    await form.getByLabel("Module reference").fill("Foundations");
    await form.getByRole("button", { name: "Create lesson plan" }).click();
    await expect(page.getByText("Warm-up algebra")).toBeVisible();
    await dismissFeedback(page);

    await page.getByRole("button", { name: "Clone" }).first().click();
    await expect(page.getByText("Lesson plan cloned.")).toBeVisible();
    await dismissFeedback(page);

    await page.getByRole("button", { name: "Snapshot" }).first().click();
    await expect(page.getByText("Lesson plan snapshot saved.")).toBeVisible();
    await expect(page.getByText("Warm-up algebra (snapshot)")).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
