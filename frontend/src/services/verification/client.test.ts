import { describe, expect, it } from "vitest";
import { createMockVerificationClient } from "./client";

describe("verification", () => {
  it("approves a pending request", async () => {
    const client = createMockVerificationClient();
    const row = (await client.list())[0]!;
    const approved = await client.approve(row.id);
    expect(approved.status).toBe("approved");
  });
});
