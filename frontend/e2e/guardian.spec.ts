import { expect, test } from "@playwright/test";

test.describe("guardian persona smoke", () => {
  test("accepts relationship and opens guardian dashboard", async ({
    page,
  }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/guardian/activate?lang=en");
    await expect(
      page.getByRole("heading", { name: "Activate guardian persona" }),
    ).toBeVisible();
    await expect(page.getByText("Sara")).toBeVisible();
    await page.getByRole("button", { name: "Accept relationship" }).click();
    await expect(page).toHaveURL(/\/guardian/);
    await expect(
      page.getByRole("heading", { name: "Guardian dashboard" }),
    ).toBeVisible();
  });
});
