import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("verified reviews smoke", () => {
  test("shows published verified reviews only", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/reviews?lang=en&target=sara-english");
    await expect(
      page.getByRole("heading", { name: "Verified reviews", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("reviews-average")).toContainText("5.0");
    await expect(
      page
        .getByRole("list", { name: "Reviews" })
        .getByText("Clear lessons and patient coaching."),
    ).toBeVisible();
    await expect(page.getByText("Hidden moderated review")).toHaveCount(0);
  });

  test("eligible signed-in user can submit a review", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/reviews?lang=en&target=sara-english");
    await expect(page.getByLabel("Your review")).toBeVisible({
      timeout: 20_000,
    });
    await page
      .getByLabel("Your review")
      .fill("Great verified enrollment experience.");
    await page.getByRole("button", { name: "Submit review" }).click();
    await expect(page.getByText("Review published.")).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page
        .getByRole("list", { name: "Reviews" })
        .getByText("Great verified enrollment experience."),
    ).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
