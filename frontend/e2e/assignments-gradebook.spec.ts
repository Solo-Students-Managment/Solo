import { expect, test } from "@playwright/test";

import {
  assertNoAuthSecretsInBrowserStorage,
  createOrganization,
  signIn,
} from "./helpers";

test.describe("assignments and gradebook smoke", () => {
  test("publishes assignment, records submission, and saves grade", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Assignments School");
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/assignments?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Assignments", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByLabel("Title", { exact: true }).fill("Homework 1");
    await page.getByLabel("Due date").fill("2026-10-01T12:00");
    await page.getByRole("button", { name: "Publish assignment" }).click();
    await expect(page.getByText("Homework 1").first()).toBeVisible();

    const submitForm = page.getByRole("form", { name: "Record submission" });
    await submitForm.getByLabel("Assignment title").fill("Homework 1");
    await submitForm.getByLabel("Student name").fill("Sara");
    await submitForm.getByRole("button", { name: "Record submission" }).click();
    await expect(page.getByText("Submission recorded.")).toBeVisible();

    await page.goto(`/org/${orgId}/gradebook?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Gradebook", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await page.getByLabel("Student name").fill("Sara");
    await page.getByLabel("Subject").fill("Math");
    await page.getByLabel("Score").fill("95");
    await page.getByRole("button", { name: "Save grade" }).click();
    await expect(page.getByText("Grade saved.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Sara" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "95" })).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
