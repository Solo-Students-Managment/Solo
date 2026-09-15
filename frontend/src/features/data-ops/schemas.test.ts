import { describe, expect, it } from "vitest";
import { createDataJobSchema } from "./schemas";

describe("createDataJobSchema", () => {
  it("requires resource key", () => {
    expect(
      createDataJobSchema.safeParse({ jobType: "export", resourceKey: "" })
        .success,
    ).toBe(false);
  });
});
