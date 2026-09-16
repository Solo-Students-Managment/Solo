import { expect, test, type Page } from "@playwright/test";
import {
  assertNoAuthSecretsInBrowserStorage,
  createOrganization,
  signIn,
} from "./helpers";

async function dismissFeedback(page: Page) {
  const dismiss = page.getByRole("button", { name: "Dismiss" });
  while ((await dismiss.count()) > 0) await dismiss.first().click();
}

test.describe("cancellation smoke", () => {
  test("requests cancellation and accepts retention offer", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Cancel School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/cancel?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Cancel subscription", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByLabel("Cancellation reason").fill("too expensive");
    await page.getByRole("button", { name: "Request cancellation" }).click();
    await expect(page.getByTestId("cancel-status")).toHaveText(
      "Pending cancellation",
    );
    await page.getByRole("button", { name: "Accept offer" }).first().click();
    await expect(page.getByTestId("cancel-status")).toHaveText("Active");
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
