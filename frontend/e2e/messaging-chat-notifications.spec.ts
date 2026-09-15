import { expect, test } from "@playwright/test";

import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("messaging chat notifications smoke", () => {
  test("sends direct message, creates chat room, and marks notification read", async ({
    page,
  }) => {
    await signIn(page);

    await page.goto("/personal/messages?lang=en");
    await expect(
      page.getByRole("heading", { name: "Messages", exact: true }),
    ).toBeVisible();
    await page.locator("#msg-subject").fill("Math");
    await page.locator("#msg-to").fill("Teacher Ali");
    await page.locator("#msg-body").fill("Hello about homework");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Message sent.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Teacher Ali" })).toBeVisible();
    await expect(page.getByText("Hello about homework")).toBeVisible();

    const storage = await page.evaluate(() =>
      JSON.stringify(window.localStorage),
    );
    expect(storage).not.toContain("Hello about homework");

    await page.goto("/personal/chat?lang=en");
    await expect(
      page.getByRole("heading", { name: "Chat rooms" }),
    ).toBeVisible();
    await page.locator("#chat-name").fill("Class A room");
    await page.getByRole("button", { name: "Create room" }).click();
    await expect(page.getByText("Class A room")).toBeVisible();
    await page.locator("tbody").getByRole("button", { name: "Open" }).click();
    await page.locator("#chat-body").fill("Welcome class");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Welcome class")).toBeVisible();

    await page.goto("/personal/notifications?lang=en");
    await expect(
      page.getByRole("heading", { name: "Notification center" }),
    ).toBeVisible();
    await expect(page.getByText("New homework published")).toBeVisible();
    await page.getByRole("button", { name: "Mark read" }).click();
    await expect(page.getByText("Read").first()).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
