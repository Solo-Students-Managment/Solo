import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("trial booking smoke", () => {
  test("lists available trial slots", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/trials?lang=en&provider=sara-english");
    await expect(
      page.getByRole("heading", { name: "Trial lessons", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("list", { name: "Trial slots" }).getByText("Sara English"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Book trial" }),
    ).toBeDisabled();
  });

  test("signed-in user can book and see booking", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/trials?lang=en&provider=sara-english");
    await expect(page.getByRole("list", { name: "Trial slots" })).toBeVisible({
      timeout: 20_000,
    });
    await page.getByRole("button", { name: "Book trial" }).click();
    await expect(page.getByText("Trial booked.")).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "My bookings" }).click();
    await expect(
      page
        .getByRole("list", { name: "My trial bookings" })
        .getByText("Confirmed"),
    ).toBeVisible({ timeout: 15_000 });
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
