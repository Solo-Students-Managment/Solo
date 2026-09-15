import { expect, test } from "@playwright/test";

import {
  assertNoAuthSecretsInBrowserStorage,
  createOrganization,
  signIn,
} from "./helpers";

function orgIdFromUrl(url: string): string {
  const match = url.match(/\/org\/([^/?]+)/);
  if (!match?.[1]) {
    throw new Error(`Missing org id in url: ${url}`);
  }
  return match[1];
}

test.describe("tuition resources reports smoke", () => {
  test("records tuition, publishes resource, and exports report", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Ops School");
    const orgId = orgIdFromUrl(page.url());

    await page.goto(`/org/${orgId}/tuition?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Tuition tracking", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByLabel("Student name").fill("Sara");
    await page.getByLabel("Amount (minor units)").fill("150000");
    await page.getByLabel("Due date").fill("2026-11-01");
    await page.getByRole("button", { name: "Save record" }).click();
    await expect(page.getByText("Tuition record saved.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Sara" })).toBeVisible();

    await page.goto(`/org/${orgId}/resources?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Resource library", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByLabel("Subject").fill("Math");
    await page.getByLabel("Title").fill("Worksheet v1");
    await page.getByRole("button", { name: "Publish version" }).click();
    await expect(page.getByText("Worksheet v1")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Safe" })).toBeVisible();

    await page.goto(`/org/${orgId}/reports?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Educational reports", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByLabel("View name").fill("Attendance weekly");
    await page.getByRole("button", { name: "Save view" }).click();
    await expect(page.getByText("Attendance weekly")).toBeVisible();
    await page.locator("tbody").getByRole("button", { name: "Export" }).click();
    await expect(page.getByLabel("Export preview")).toContainText("attendance");

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
