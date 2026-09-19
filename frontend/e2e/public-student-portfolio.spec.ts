import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("public student portfolio smoke", () => {
  test("shows published minor-safe portfolio", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/p/mina-portfolio?lang=en");
    await expect(
      page.getByRole("heading", { name: "Mina Student", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("minor-notice")).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Interests" }).getByText("Writing", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("student can publish portfolio", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/student/public-portfolio?lang=en");
    await expect(
      page.getByRole("heading", {
        name: "Public student portfolio",
        exact: true,
      }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Publish portfolio" }).click();
    await expect(page.getByTestId("student-portfolio-status")).toContainText(
      "Published",
    );
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
