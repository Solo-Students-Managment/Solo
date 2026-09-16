import { expect, test } from "@playwright/test";
import { createOrganization, signIn } from "./helpers";

test.describe("usage quota smoke", () => {
  test("shows quota meters", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Usage School");
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/usage?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Usage & quotas", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Over quota")).toBeVisible();
  });
});
