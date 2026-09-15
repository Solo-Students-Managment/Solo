import { expect, test } from "@playwright/test";

test.describe("student persona smoke", () => {
  test("accepts relationship and opens student dashboard", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/student/activate?lang=en");
    await expect(
      page.getByRole("heading", { name: "Activate student persona" }),
    ).toBeVisible();
    await expect(page.getByText("Mathematics")).toBeVisible();
    await page.getByRole("button", { name: "Accept relationship" }).click();
    await expect(page).toHaveURL(/\/student/);
    await expect(
      page.getByRole("heading", { name: "Student dashboard" }),
    ).toBeVisible();
  });

  test("denies dashboard without student persona", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/student?lang=en");
    await expect(page.getByText(/Activate the student persona/i)).toBeVisible();
  });
});
