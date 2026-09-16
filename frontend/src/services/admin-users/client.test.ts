import { describe, expect, it } from "vitest";
import { createMockAdminUsersClient } from "./client";

describe("admin users", () => {
  it("restricts and unrestricts a user", async () => {
    const client = createMockAdminUsersClient();
    const users = await client.list();
    const id = users[0]!.id;
    const restricted = await client.restrict(id, "abuse");
    expect(restricted.restricted).toBe(true);
    const open = await client.unrestrict(id);
    expect(open.restricted).toBe(false);
  });
});
