import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("marketplace discovery smoke", () => {
  test("filters discovery and shows map points", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/discover?lang=en&kind=teacher&subject=English");
    await expect(
      page.getByRole("heading", {
        name: "Discover teachers & schools",
        exact: true,
      }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("list", { name: "Discovery results" }).getByRole("link", {
        name: "Sara English",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Map view" }).click();
    await expect(
      page.getByRole("list", { name: "Map results" }).getByText("Sara English"),
    ).toBeVisible();
  });

  test("signed-in user can save an item", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/discover?lang=en&kind=teacher&subject=English");
    await expect(
      page.getByRole("list", { name: "Discovery results" }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByRole("button", { name: "Saved" }).click();
    await expect(
      page.getByRole("list", { name: "Saved items" }).getByRole("link", {
        name: "Sara English",
        exact: true,
      }),
    ).toBeVisible({ timeout: 15_000 });
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
