import { expect, test } from "@playwright/test";

test.describe("organization members smoke", () => {
  test("owner can open members and invite staff", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/org/new?lang=en");
    await page.getByLabel("Organization name").fill("Members School");
    await page.getByRole("button", { name: "Create and enter" }).click();
    await expect(page).toHaveURL(/\/org\/org_/);
    await page.getByRole("link", { name: "Members" }).first().click();
    await expect(page).toHaveURL(/\/members/);
    await expect(
      page.getByRole("heading", { name: "Staff & membership" }),
    ).toBeVisible();
    await page.getByLabel("Display name").fill("Invited Teacher");
    await page.getByLabel("Mobile number").fill("9129998877");
    await page.getByRole("button", { name: "Send invite" }).click();
    await expect(page.getByText("Invited Teacher")).toBeVisible();
    await expect(page.getByText("Invited").first()).toBeVisible();
  });
});
