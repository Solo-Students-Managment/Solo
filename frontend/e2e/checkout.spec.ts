import { expect, test } from "@playwright/test";
import { createOrganization, signIn } from "./helpers";

test.describe("checkout smoke", () => {
  test("starts and completes mock checkout", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Checkout School");
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/checkout?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Checkout", exact: true, level: 1 }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Start checkout" }).first().click();
    await expect(page.getByTestId("active-checkout-session")).toBeVisible();
    await page
      .getByRole("button", { name: "Complete payment" })
      .first()
      .click();
    await expect(page.getByText("Succeeded")).toBeVisible();
  });
});
