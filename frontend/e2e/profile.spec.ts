import { expect, test } from "@playwright/test";

test.describe("profile preferences smoke", () => {
  test("happy path updates first name", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/personal/profile?lang=en");
    await expect(
      page.getByRole("heading", { name: "Profile & preferences" }),
    ).toBeVisible();
    await page.getByLabel("First name").fill("Sara");
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByLabel("First name")).toHaveValue("Sara");
  });

  test("invalid email stays on form", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/personal/profile?lang=en");
    await page.getByLabel("Email (optional)").fill("bad-email");
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  });
});
