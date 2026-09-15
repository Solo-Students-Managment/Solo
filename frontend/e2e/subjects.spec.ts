import { expect, test } from "@playwright/test";

test.describe("subjects smoke", () => {
  test("creates organization subject and shows subject switcher", async ({
    page,
  }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/org/new?lang=en");
    await page.getByLabel("Organization name").fill("Subjects School");
    await page.getByRole("button", { name: "Create and enter" }).click();
    await expect(page).toHaveURL(/\/org\/org_/);
    await page.getByRole("link", { name: "Subjects" }).first().click();
    await expect(page.getByRole("heading", { name: "Subjects" })).toBeVisible();
    await page.getByLabel("Subject name").fill("Chemistry");
    await page.getByLabel("Code").fill("CHEM");
    await page.getByLabel("Level").fill("Grade 10");
    await page.getByLabel("Default teacher").fill("Dr. Nouri");
    await page.getByRole("button", { name: "Create subject" }).click();
    await expect(page.getByText("Chemistry")).toBeVisible();
  });
});
