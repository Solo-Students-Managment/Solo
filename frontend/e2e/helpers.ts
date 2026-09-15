import { expect, type Page } from "@playwright/test";

export async function signIn(page: Page) {
  await page.goto("/auth/login?lang=en");
  await page.getByLabel("Mobile number").fill("9121234567");
  await page.getByLabel("Password", { exact: true }).fill("Password1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome to Solo" }),
  ).toBeVisible({ timeout: 20_000 });
}

export async function createOrganization(page: Page, name: string) {
  await page.goto("/org/new?lang=en");
  await page.getByLabel("Organization name").fill(name);
  await page.getByRole("button", { name: "Create and enter" }).click();
  await expect(page).toHaveURL(/\/org\/org_/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "Organization dashboard" }),
  ).toBeVisible({ timeout: 15_000 });
}

export async function assertNoAuthSecretsInBrowserStorage(page: Page) {
  const leaked = await page.evaluate(() => {
    const blobs = [
      JSON.stringify(window.localStorage),
      JSON.stringify(window.sessionStorage),
    ];
    return blobs.some((blob) =>
      /"password"\s*:|"otp"\s*:|"refreshToken"\s*:|"accessToken"\s*:|Password1/.test(
        blob,
      ),
    );
  });
  expect(leaked).toBe(false);
}
