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

test.describe("automation smoke", () => {
  test("creates low-risk automation and verifies high-risk approval gate", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Automation School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/automation?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Automation", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const lowForm = page.getByRole("form", { name: "Create automation" });
    await lowForm.getByLabel("Name").fill("Welcome webhook");
    await lowForm.getByLabel("Trigger type").selectOption("webhook");
    await lowForm.getByLabel("Risk level").selectOption("low");
    await lowForm.getByLabel("Steps summary").fill("POST enrollment payload");
    await lowForm.getByRole("button", { name: "Create automation" }).click();
    await expect(page.getByText("Automation rule created.")).toBeVisible();
    await dismissFeedback(page);

    const lowRow = page.getByRole("row").filter({ hasText: "Welcome webhook" });
    await lowRow.getByRole("button", { name: "Activate" }).click();
    await expect(page.getByText("Automation activated.")).toBeVisible();
    await expect(
      lowRow.getByRole("cell", { name: "Active" }).first(),
    ).toBeVisible({ timeout: 15_000 });
    await dismissFeedback(page);

    const highForm = page.getByRole("form", { name: "Create automation" });
    await highForm.getByLabel("Name").fill("Bulk delete sync");
    await highForm.getByLabel("Trigger type").selectOption("schedule");
    await highForm.getByLabel("Risk level").selectOption("high");
    await highForm.getByLabel("Steps summary").fill("Archive stale records");
    await highForm.getByRole("button", { name: "Create automation" }).click();
    await expect(page.getByText("Automation rule created.")).toBeVisible();
    await dismissFeedback(page);

    const highRow = page
      .getByRole("row")
      .filter({ hasText: "Bulk delete sync" });
    await expect(
      highRow.getByText(
        "High-risk automations require explicit approval before activation.",
      ),
    ).toBeVisible();
    const activateBtn = highRow.getByRole("button", { name: "Activate" });
    await expect(activateBtn).toBeDisabled();
    await highRow.getByLabel("Approval granted").check();
    await expect(activateBtn).toBeEnabled();
    await activateBtn.click();
    await expect(page.getByText("Automation activated.")).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
