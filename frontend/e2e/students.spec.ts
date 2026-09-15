import { expect, test } from "@playwright/test";

test.describe("org students smoke", () => {
  test("adds student and links guardian", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/org/new?lang=en");
    await page.getByLabel("Organization name").fill("Students School");
    await page.getByRole("button", { name: "Create and enter" }).click();
    await expect(page).toHaveURL(/\/org\/org_/);
    await page.getByRole("link", { name: "Students" }).first().click();
    await expect(page.getByRole("heading", { name: "Students" })).toBeVisible();
    await page.getByLabel("Display name").fill("Nima");
    await page.getByLabel("Mobile number").fill("9123332211");
    await page.getByRole("button", { name: "Add student" }).click();
    await expect(page.getByText("Nima")).toBeVisible();
    await page.getByRole("link", { name: "Open" }).click();
    await expect(
      page.getByRole("heading", { name: "Student detail" }),
    ).toBeVisible();
    await page.getByLabel("Display name").fill("Nima Parent");
    await page.getByLabel("Relationship").fill("Father");
    await page.getByLabel("Mobile number").fill("9127778899");
    await page.getByRole("button", { name: "Link guardian" }).click();
    await expect(page.getByText("Nima Parent")).toBeVisible();
  });
});
