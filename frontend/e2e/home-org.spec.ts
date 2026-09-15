import { expect, test } from "@playwright/test";

test.describe("global home and org smoke", () => {
  test("persona switcher visible after login", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/(\?|$)/);
    await expect(
      page.getByRole("heading", { name: "Welcome to Solo" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Teacher" })).toBeVisible();
  });

  test("creates organization and opens dashboard", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/org/new?lang=en");
    await page.getByLabel("Organization name").fill("Demo School");
    await page.getByRole("button", { name: "Create and enter" }).click();
    await expect(page).toHaveURL(/\/org\/org_/);
    await expect(
      page.getByRole("heading", { name: "Organization dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("Demo School").first()).toBeVisible();
  });
});
