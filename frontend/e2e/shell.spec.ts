import { expect, test } from "@playwright/test";

test.describe("AppShell smoke", () => {
  test("personal surface renders navigation landmarks", async ({ page }) => {
    await page.goto("/personal");
    await expect(page.getByRole("navigation").first()).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Personal home" }),
    ).toBeVisible();
  });
});
