import { describe, expect, it } from "vitest";
import { createMockAddOnsClient } from "./client";

describe("add-ons client", () => {
  it("defaults overage opt-in to off", async () => {
    const bundle = await createMockAddOnsClient().get("org_ao");
    expect(bundle.overageOptIn).toBe(false);
  });

  it("enables overage opt-in", async () => {
    const client = createMockAddOnsClient();
    const next = await client.setOverageOptIn("org_ao2", true);
    expect(next.overageOptIn).toBe(true);
  });
});
