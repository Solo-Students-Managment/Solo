import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("articles feed smoke", () => {
  test("lists articles and opens detail", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/articles?lang=en");
    await expect(
      page.getByRole("heading", { name: "Articles", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("link", { name: "Study Tips for 2026" }).click();
    await expect(
      page.getByRole("heading", { name: "Study Tips for 2026", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await signIn(page);
    await page.goto("/articles/study-tips-2026?lang=en");
    await page.getByRole("button", { name: "Bookmark" }).click();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
