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

test.describe("positions smoke", () => {
  test("creates positions and shows org chart", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Positions School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/positions?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Positions & org chart", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Create position" });
    await form.getByLabel("Title").fill("Principal");
    await form.getByLabel("Holder display name (optional)").fill("Ada Admin");
    await form.getByRole("button", { name: "Create position" }).click();
    await expect(page.getByText("Position created.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Principal" })).toBeVisible();
    await dismissFeedback(page);

    await form.getByLabel("Title").fill("Teacher Lead");
    await form.getByLabel("Holder display name (optional)").fill("");
    await form.getByLabel("Reports to (optional)").selectOption({
      label: "Principal",
    });
    await form.getByRole("button", { name: "Create position" }).click();
    await expect(page.getByText("Position created.")).toBeVisible();
    await dismissFeedback(page);

    await page.getByRole("link", { name: "Org chart", exact: true }).click();
    const chart = page.getByRole("list", { name: "Organization chart" });
    await expect(chart).toBeVisible();
    await expect(chart.getByText("Principal")).toBeVisible();
    await expect(chart.getByText("Teacher Lead")).toBeVisible();
    await expect(chart.getByText("Vacant")).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
