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

test.describe("public school profile smoke", () => {
  test("shows published institute and unpublished school", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/p/nova-institute?lang=en");
    await expect(
      page.getByRole("heading", { name: "Nova Institute", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Institute", { exact: true })).toBeVisible();

    await page.goto("/p/sunrise-school?lang=en");
    await expect(
      page.getByText("This profile is not public", { exact: true }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("org can publish public profile", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Public School Org");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/public-profile?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Public school profile", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Publish profile" }).click();
    await expect(page.getByTestId("school-profile-status")).toContainText(
      "Published",
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
