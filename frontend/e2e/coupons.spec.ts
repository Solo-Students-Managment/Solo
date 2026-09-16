import { expect, test } from "@playwright/test";
import { createOrganization, signIn } from "./helpers";

test.describe("coupons smoke", () => {
  test("validates welcome coupon", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Coupon School");
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/coupons?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Coupons", exact: true, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByLabel("Coupon code").fill("WELCOME20");
    await page.getByRole("button", { name: "Validate" }).click();
    await expect(page.getByText("Coupon is valid.")).toBeVisible();
  });
});
