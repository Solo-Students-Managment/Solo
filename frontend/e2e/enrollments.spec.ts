import { expect, test } from "@playwright/test";

test.describe("enrollments smoke", () => {
  test("enrolls student and updates status", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/org/new?lang=en");
    await page.getByLabel("Organization name").fill("Enroll School");
    await page.getByRole("button", { name: "Create and enter" }).click();
    await page.getByRole("link", { name: "Enrollments" }).first().click();
    await expect(
      page.getByRole("heading", { name: "Enrollments" }),
    ).toBeVisible();
    await page.getByLabel("Student name").fill("Sara");
    await page.getByLabel("Course name").fill("Algebra");
    await page.getByLabel("Class name").fill("Section A");
    await page.getByRole("button", { name: "Enroll" }).click();
    await expect(page.getByText("Sara")).toBeVisible();
  });
});
