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

test.describe("change phone and recovery smoke", () => {
  test("happy path changes phone after login", async ({ page }) => {
    await signIn(page);
    await page.goto("/personal/phone?lang=en");
    await expect(
      page.getByRole("heading", { name: "Change phone number" }),
    ).toBeVisible();
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByLabel("Mobile number").fill("9331112233");
    await page.getByRole("button", { name: "Send verification codes" }).click();
    await expect(page.getByText(/Codes sent/i)).toBeVisible();
    await page.getByLabel("Code sent to current phone").fill("123456");
    await page.getByLabel("Code sent to new phone").fill("123456");
    await page.getByRole("button", { name: "Confirm phone change" }).click();
    await expect(
      page.getByRole("button", { name: "Send verification codes" }),
    ).toBeVisible();
  });

  test("support recovery submits without storing secrets", async ({ page }) => {
    await page.goto("/auth/recover?lang=en");
    await expect(
      page.getByRole("heading", { name: "Account recovery" }),
    ).toBeVisible();
    await page.getByLabel("First name").fill("Ali");
    await page.getByLabel("Last name").fill("Reza");
    await page
      .getByLabel("What happened?")
      .fill("I lost my SIM card last week.");
    await page.getByLabel("Mobile number").nth(1).fill("9129998877");
    await page.getByRole("button", { name: "Submit recovery request" }).click();
    await expect(page.getByText(/Request submitted/i)).toBeVisible();
  });
});
