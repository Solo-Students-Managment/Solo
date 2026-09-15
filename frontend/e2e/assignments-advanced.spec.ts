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

test.describe("advanced assignments smoke", () => {
  test("group team, peer review, revision, and grade release", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await createOrganization(page, "Advanced Assignments School");
    await dismissFeedback(page);
    const orgId = page.url().match(/\/org\/([^/?]+)/)?.[1];
    if (!orgId) throw new Error("missing org id");

    await page.goto(`/org/${orgId}/assignments?lang=en`);
    await expect(
      page.getByRole("heading", { name: "Assignments", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    const publishForm = page.getByRole("form", { name: "Publish assignment" });
    await publishForm
      .getByLabel("Title", { exact: true })
      .fill("Group Project");
    await publishForm.getByLabel("Due date").fill("2026-10-01T12:00");
    await publishForm.getByLabel("Collaboration").selectOption("group");
    await publishForm.getByLabel("Peer review").selectOption("yes");
    await publishForm.getByLabel("Max revisions").fill("2");
    await publishForm
      .getByRole("button", { name: "Publish assignment" })
      .click();
    await expect(page.getByText("Group Project").first()).toBeVisible();
    await dismissFeedback(page);

    const teamForm = page.getByRole("form", { name: "Create team" });
    await teamForm.getByLabel("Assignment title").fill("Group Project");
    await teamForm.getByLabel("Team name").fill("Alpha");
    await teamForm.getByLabel("Members").fill("Ali, Sara");
    await teamForm.getByRole("button", { name: "Create team" }).click();
    await expect(page.getByText("Team created.")).toBeVisible();
    await dismissFeedback(page);

    const peerForm = page.getByRole("form", { name: "Save peer review" });
    await peerForm.getByLabel("Assignment title").fill("Group Project");
    await peerForm.getByLabel("Reviewer").fill("Ali");
    await peerForm.getByLabel("Reviewee").fill("Sara");
    await peerForm.getByLabel("Peer score").fill("90");
    await peerForm.getByRole("button", { name: "Save peer review" }).click();
    await expect(page.getByText("Peer review saved.")).toBeVisible();
    await dismissFeedback(page);

    const revisionForm = page.getByRole("form", { name: "Record revision" });
    await revisionForm.getByLabel("Assignment title").fill("Group Project");
    await revisionForm.getByLabel("Student name").fill("Sara");
    await revisionForm.getByRole("button", { name: "Record revision" }).click();
    await expect(page.getByText("Revision recorded.")).toBeVisible();
    await dismissFeedback(page);

    const releaseForm = page.getByRole("form", { name: "Release grades" });
    await releaseForm.getByLabel("Assignment title").fill("Group Project");
    await releaseForm.getByRole("button", { name: "Release grades" }).click();
    await expect(page.getByText("Grades released.")).toBeVisible();
    await expect(page.getByText("Released").first()).toBeVisible();

    await assertNoAuthSecretsInBrowserStorage(page);
  });
});
