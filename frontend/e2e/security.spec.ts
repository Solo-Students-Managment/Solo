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

test.describe("account security smoke", () => {
  test("happy path enables SMS 2FA after login", async ({ page }) => {
    await signIn(page);
    await page.goto("/personal/security?lang=en");
    await expect(
      page.getByRole("heading", { name: "Account security" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Enable SMS 2FA" }).click();
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Confirm" }).click();
    await page.getByLabel("Verification code").fill("123456");
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText("2FA is on")).toBeVisible();
  });

  test("wrong reauth password keeps device list unchanged", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/personal/security?lang=en");
    await expect(page.getByText("iPhone")).toBeVisible();
    await page.getByRole("button", { name: "Revoke" }).click();
    await page.getByLabel("Password", { exact: true }).fill("WrongPass1");
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText("iPhone")).toBeVisible();
  });
});
