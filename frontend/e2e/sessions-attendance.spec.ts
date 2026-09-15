import { expect, test } from "@playwright/test";

test.describe("sessions and attendance smoke", () => {
  test("schedules session, evaluates, marks attendance", async ({ page }) => {
    await page.goto("/auth/login?lang=en");
    await page.getByLabel("Mobile number").fill("9121234567");
    await page.getByLabel("Password", { exact: true }).fill("Password1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.goto("/org/new?lang=en");
    await page.getByLabel("Organization name").fill("Sessions School");
    await page.getByRole("button", { name: "Create and enter" }).click();
    await page.getByRole("link", { name: "Sessions" }).first().click();
    await expect(page.getByRole("heading", { name: "Sessions" })).toBeVisible();
    await page.getByLabel("Class name").fill("Section A");
    await page.getByLabel("Starts at").fill("2026-09-20T10:00");
    await page.getByLabel("Ends at").fill("2026-09-20T11:00");
    await page.getByRole("button", { name: "Schedule" }).click();
    await expect(page.getByText("Section A")).toBeVisible();
    await page.getByRole("link", { name: "Open" }).click();
    await expect(
      page.getByRole("heading", { name: "Session detail" }),
    ).toBeVisible();
    await page.getByLabel("Score").fill("90");
    await page.getByLabel("Comment").fill("Great work");
    await page.getByRole("button", { name: "Save evaluation" }).click();
    await page.getByRole("button", { name: "Publish report" }).click();
    await expect(page.getByText("Published report")).toBeVisible();

    const sessionUrl = page.url();
    const sessionId = sessionUrl.split("/sessions/")[1]?.split("?")[0] ?? "";
    await page.getByRole("link", { name: "Attendance" }).first().click();
    await page.getByLabel("Session id").fill(sessionId);
    await page.getByRole("button", { name: "Load session attendance" }).click();
    await page.getByLabel("Student name").fill("Sara");
    await page.getByRole("button", { name: "Mark attendance" }).click();
    await expect(page.getByText("Sara")).toBeVisible();
  });
});
