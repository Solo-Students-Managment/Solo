import { describe, expect, it } from "vitest";
import { createMockShippingReturnsClient } from "./client";

describe("shipping returns", () => {
  it("cruds addresses and requests return", async () => {
    const client = createMockShippingReturnsClient();
    const [addr] = await client.listAddresses();
    expect(addr!.label).toBe("Home");
    const created = await client.createAddress({
      label: "Office",
      line1: "456 Work Ave",
      city: "Tehran",
      postalCode: "67890",
      country: "IR",
      isDefault: false,
    });
    expect(created.id).toBeTruthy();
    const ret = await client.requestReturn("ord_1", "wrong size");
    expect(ret.type).toBe("return");
  });
});
