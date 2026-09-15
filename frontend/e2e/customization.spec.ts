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

test.describe("customization smoke", () => {
  test("creates field status and tag", async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Customization School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");
    await page.goto(`/org/${orgId}/customization?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Customization", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const fieldForm = page.getByRole("form", { name: "Create field" });
    await fieldForm.getByLabel("Name").fill("Grade band");
    await fieldForm.getByLabel("Field type").selectOption("select");
    await fieldForm.getByLabel("Select options (comma-separated)").fill("A, B");
    await fieldForm.getByRole("button", { name: "Create field" }).click();
    await expect(page.getByText("Custom field created.")).toBeVisible();
    await dismissFeedback(page);

    const statusForm = page.getByRole("form", { name: "Create status" });
    await statusForm.getByLabel("Name").fill("Needs review");
    await statusForm.getByLabel("Color key").fill("amber");
    await statusForm.getByRole("button", { name: "Create status" }).click();
    await expect(page.getByText("Custom status created.")).toBeVisible();
    await dismissFeedback(page);

    const tagForm = page.getByRole("form", { name: "Create tag" });
    await tagForm.getByLabel("Name").fill("Priority");
    await tagForm.getByLabel("Color key").fill("rose");
    await tagForm.getByRole("button", { name: "Create tag" }).click();
    await expect(page.getByText("Context tag created.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Grade band" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Needs review" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "Priority" })).toBeVisible();
    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
