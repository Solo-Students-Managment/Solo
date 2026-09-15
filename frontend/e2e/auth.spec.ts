import { expect, test } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/auth/login?lang=en");
  await page.getByLabel("Mobile number").fill("9121234567");
  await page.getByLabel("Password", { exact: true }).fill("Password1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/(\?|$)/);
  await expect(
    page.getByRole("heading", { name: "Welcome to Solo" }),
  ).toBeVisible();
}

test.describe("auth login smoke", () => {
  test("happy path signs in and reaches global home", async ({ page }) => {
    await signIn(page);
  });

  test("wrong password stays on login", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("bad-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});
