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

test.describe("events smoke", () => {
  test("creates event, RSVPs, and checks in", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Events School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/events?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Events", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const form = page.getByRole("form", { name: "Create event" });
    await form.getByLabel("Title").fill("Parent open day");
    await form.getByLabel("Starts at").fill("2026-10-15T18:00");
    await form.getByLabel("Capacity").fill("100");
    await form.getByRole("button", { name: "Create event" }).click();
    await expect(page.getByText("Event created.")).toBeVisible();
    await dismissFeedback(page);

    const row = page.getByRole("row").filter({ hasText: "Parent open day" });
    await row.getByRole("button", { name: "RSVP" }).click();
    await expect(page.getByText("RSVP recorded.")).toBeVisible();
    await expect(row.getByRole("cell", { name: "1/100" })).toBeVisible();
    await dismissFeedback(page);
    await row.getByRole("button", { name: "Check in" }).click();
    await expect(page.getByText("Guest checked in.")).toBeVisible();
    await expect(
      row.getByRole("cell", { name: "1", exact: true }),
    ).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
