import { describe, expect, it } from "vitest";
import {
  createMockBulkActionsClient,
  requiresBulkApproval,
  __resetMockBulkActions,
} from "./client";

describe("requiresBulkApproval", () => {
  it("requires approval for large batches and destructive actions", () => {
    expect(requiresBulkApproval(9, "update")).toBe(false);
    expect(requiresBulkApproval(10, "update")).toBe(true);
    expect(requiresBulkApproval(3, "delete")).toBe(true);
    expect(requiresBulkApproval(3, "archive")).toBe(true);
  });
});

describe("bulk actions client", () => {
  it("runs small jobs without approval and blocks large jobs", async () => {
    __resetMockBulkActions();
    const client = createMockBulkActionsClient();
    const small = await client.create("org_1", {
      moduleKey: "students",
      actionKey: "tag",
      itemCount: 3,
    });
    const completed = await client.run("org_1", String(small.id));
    expect(completed.status).toBe("completed");

    const large = await client.create("org_1", {
      moduleKey: "students",
      actionKey: "delete",
      itemCount: 12,
    });
    await expect(
      client.run("org_1", String(large.id), { approvalGranted: false }),
    ).rejects.toThrow("approval required");
    const approved = await client.run("org_1", String(large.id), {
      approvalGranted: true,
    });
    expect(approved.status).toBe("completed");
  });
});
