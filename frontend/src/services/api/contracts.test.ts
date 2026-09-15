import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  apiErrorSchema,
  collectionSchema,
  createIdempotencyKey,
  moneySchema,
  opaqueIdSchema,
} from "./contracts";
import { localizeApiError } from "./client";

describe("API contracts", () => {
  it("parses money and opaque ids", () => {
    expect(moneySchema.parse({ amount: 1000, currency: "IRR" }).currency).toBe(
      "IRR",
    );
    expect(opaqueIdSchema.parse("usr_1")).toBe("usr_1");
  });

  it("parses error envelopes and localizes message keys", () => {
    const error = apiErrorSchema.parse({
      code: "FORBIDDEN",
      messageKey: "errors.forbidden",
      status: 403,
    });
    expect(localizeApiError(error, "en")).toMatch(/permission/i);
  });

  it("supports collection pagination schema and idempotency keys", () => {
    const schema = collectionSchema(z.object({ id: z.string() }));
    const parsed = schema.parse({
      data: [{ id: "1" }],
      meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
    });
    expect(parsed.meta.totalItems).toBe(1);
    expect(createIdempotencyKey("test")).toMatch(/^test_/);
  });
});
