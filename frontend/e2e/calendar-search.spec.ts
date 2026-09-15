import { expect, test } from "@playwright/test";

import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("calendar and search smoke", () => {
  test("shows upcoming events and hides unauthorized search hits", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await signIn(page);

    await page.goto("/personal/calendar?lang=en");
    await expect(
      page.getByRole("heading", { name: "Upcoming calendar" }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Math session")).toBeVisible();

    await page.goto("/personal/search?lang=en");
    await expect(
      page.getByRole("heading", { name: "Global search" }),
    ).toBeVisible();
    await page.locator("#global-search").fill("Algebra");
    await expect(
      page.getByRole("link", { name: "Algebra course", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Private message")).toHaveCount(0);

    await page.locator("#global-search").fill("Private");
    await expect(page.getByText("Private message")).toHaveCount(0);
    await expect(page.getByText("No authorized results.")).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
