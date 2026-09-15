import { expect, test } from "@playwright/test";

test.describe("courses smoke", () => {
  test("creates course and class", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/org/new?lang=en");
    await page.getByLabel("Organization name").fill("Courses School");
    await page.getByRole("button", { name: "Create and enter" }).click();
    await page.getByRole("link", { name: "Courses" }).first().click();
    await expect(
      page.getByRole("heading", { name: "Courses & classes" }),
    ).toBeVisible();
    await page.getByLabel("Course name").fill("Algebra I");
    await page.getByLabel("Subject name").fill("Mathematics");
    await page.getByRole("button", { name: "Create course" }).click();
    await expect(page.getByText("Algebra I")).toBeVisible();
    await page.getByLabel("Class name").fill("Section A");
    await page.getByLabel("Capacity").fill("20");
    await page.getByRole("button", { name: "Create class" }).click();
    await expect(page.getByText("Section A")).toBeVisible();
  });
});
