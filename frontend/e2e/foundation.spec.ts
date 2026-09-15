import { expect, test } from "@playwright/test";

test.describe("F0 foundation smoke", () => {
  test("shows Persian foundation status by default", async ({ page }) => {
    await page.goto("/dev/foundation");
    await expect(page.getByText("Solo").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "پایه‌گذاری فرانت‌اند" }),
    ).toBeVisible();
    await expect(page.locator("main")).toHaveAttribute("dir", "rtl");
  });

  test("switches to English LTR via language control", async ({ page }) => {
    await page.goto("/dev/foundation?lang=fa");
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page).toHaveURL(/lang=en/);
    await expect(
      page.getByRole("heading", { name: "Frontend foundation" }),
    ).toBeVisible();
    await expect(page.locator("main")).toHaveAttribute("dir", "ltr");
  });

  test("rejects unknown lang with default Persian content", async ({
    page,
  }) => {
    await page.goto("/dev/foundation?lang=zz");
    await expect(
      page.getByRole("heading", { name: "پایه‌گذاری فرانت‌اند" }),
    ).toBeVisible();
  });
});
