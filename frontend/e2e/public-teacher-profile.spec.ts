import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("public teacher profile smoke", () => {
  test("shows published teacher profile and unpublished state", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto("/p/sara-english?lang=en");
    await expect(
      page.getByRole("heading", { name: "Sara English", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("region", { name: "Subjects" }).getByText("English", {
        exact: true,
      }),
    ).toBeVisible();

    await page.goto("/p/neda-math?lang=en");
    await expect(
      page.getByText("This profile is not public", { exact: true }),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("teacher can publish their profile", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/teacher/public-profile?lang=en");
    await expect(
      page.getByRole("heading", {
        name: "Public teacher profile",
        exact: true,
      }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("teacher-profile-status")).toContainText(
      "Unpublished",
    );
    await page.getByRole("button", { name: "Publish profile" }).click();
    await expect(page.getByTestId("teacher-profile-status")).toContainText(
      "Published",
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
