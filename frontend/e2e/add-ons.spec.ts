import { expect, test } from "@playwright/test";
import { createOrganization, signIn } from "./helpers";

test.describe("add-ons smoke", () => {
  test("shows overage opt-in off by default", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "AddOns School");
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/add-ons?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Add-ons", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByLabel("Allow usage overage billing"),
    ).not.toBeChecked();
  });
});
