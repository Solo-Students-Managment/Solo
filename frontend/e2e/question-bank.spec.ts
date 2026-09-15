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

test.describe("question bank smoke", () => {
  test("creates and forks a rich question", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Question Bank School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/question-bank?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Question bank", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Save question" });
    await form.locator(".ProseMirror").click();
    await page.keyboard.type("What is photosynthesis?");
    await form.getByLabel("Question type").selectOption("mcq");
    await form.getByLabel("Visibility").selectOption("school");
    await form.getByLabel("Tags").fill("biology, plants");
    await form.getByRole("button", { name: "Save question" }).click();
    await expect(page.getByText("What is photosynthesis?")).toBeVisible({
      timeout: 15_000,
    });
    await dismissFeedback(page);

    await page.getByRole("button", { name: "Fork" }).click();
    await expect(page.getByText("Question forked.")).toBeVisible();
    await expect(page.getByText("forked").first()).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
