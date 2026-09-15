import { expect, test } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/auth/login?lang=en");
  await page.getByLabel("Mobile number").fill("9121234567");
  await page.getByLabel("Password", { exact: true }).fill("Password1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome to Solo" }),
  ).toBeVisible();
}

test.describe("profile preferences smoke", () => {
  test("happy path updates first name", async ({ page }) => {
    await signIn(page);
    await page.goto("/personal/profile?lang=en");
    await expect(
      page.getByRole("heading", { name: "Profile & preferences" }),
    ).toBeVisible();
    await page.getByLabel("First name").fill("Sara");
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByLabel("First name")).toHaveValue("Sara");
  });

  test("invalid email stays on form", async ({ page }) => {
    await signIn(page);
    await page.goto("/personal/profile?lang=en");
    await page.getByLabel("Email (optional)").fill("bad-email");
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  });
});
