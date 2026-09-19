import { expect, test } from "@playwright/test";
import { assertNoAuthSecretsInBrowserStorage, signIn } from "./helpers";

test.describe("public catalog smoke", () => {
  test("lists catalog and shows full class waitlist path", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/catalog?lang=en");
    await expect(
      page.getByRole("heading", {
        name: "Course & class catalog",
        exact: true,
      }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("list", { name: "Catalog results" }).getByRole("link", {
        name: "Algebra Foundations",
        exact: true,
      }),
    ).toBeVisible();

    await page.goto("/catalog/english-conversation?lang=en");
    await expect(
      page.getByRole("heading", {
        name: "English Conversation Lab",
        exact: true,
      }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("catalog-status")).toContainText("Full");
    await expect(
      page.getByRole("button", { name: "Join waitlist" }),
    ).toBeDisabled();
  });

  test("signed-in user can request enrollment", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto("/catalog/algebra-foundations?lang=en");
    await expect(
      page.getByRole("heading", { name: "Algebra Foundations", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Request enrollment" }).click();
    await expect(page.getByText("Enrollment request submitted.")).toBeVisible({
      timeout: 15_000,
    });
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
