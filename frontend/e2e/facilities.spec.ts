import { expect, test, type Page } from "@playwright/test";

import {
  assertNoAuthSecretsInBrowserStorage,
  createOrganization,
  signIn,
} from "./helpers";

async function dismissFeedback(page: Page) {
  const dismiss = page.getByRole("button", { name: "Dismiss" });
  while ((await dismiss.count()) > 0) {
    await dismiss.first().click();
  }
}

test.describe("facilities smoke", () => {
  test("creates room and equipment for main branch", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Facilities School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/facilities?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Rooms & equipment", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const roomForm = page.getByRole("form", { name: "Create room" });
    await roomForm.getByLabel("Branch").selectOption({ label: "Main Branch" });
    await roomForm.getByLabel("Room name").fill("Lab A");
    await roomForm.getByLabel("Capacity").fill("24");
    await roomForm.getByRole("button", { name: "Create room" }).click();
    await expect(page.getByText("Room created.")).toBeVisible();
    await expect(page.getByText("Lab A")).toBeVisible();
    await dismissFeedback(page);

    await page.getByRole("link", { name: "Equipment", exact: true }).click();
    const eqForm = page.getByRole("form", { name: "Create equipment" });
    await expect(eqForm).toBeVisible();
    await eqForm.getByLabel("Branch").selectOption({ label: "Main Branch" });
    await eqForm.getByLabel("Equipment name").fill("Projector");
    await eqForm.getByLabel("Asset tag").fill("EQ-100");
    await eqForm.getByRole("button", { name: "Create equipment" }).click();
    await expect(page.getByText("Equipment created.")).toBeVisible();
    await expect(page.getByText("Projector")).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
