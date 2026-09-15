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

test.describe("shifts smoke", () => {
  test("creates a staff shift", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Shifts School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/shifts?lang=en`);
    await expect(
      page.getByRole("heading", {
        name: "Shifts & working hours",
        exact: true,
      }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Create shift" });
    await form.getByLabel("Shift name").fill("Morning Desk");
    await form.getByLabel("Weekday").selectOption("1");
    await form.getByLabel("Start time").fill("08:00");
    await form.getByLabel("End time").fill("12:00");
    await form.getByLabel("Branch name").fill("Main Branch");
    await form.getByRole("button", { name: "Create shift" }).click();
    await expect(page.getByText("Shift created.")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Morning Desk" }),
    ).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
