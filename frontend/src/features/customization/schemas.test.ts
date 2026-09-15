import { describe, expect, it } from "vitest";
import { createFieldSchema } from "./schemas";

describe("createFieldSchema", () => {
  it("rejects select without options", () => {
    expect(
      createFieldSchema.safeParse({
        name: "Level",
        fieldType: "select",
        entityTarget: "student",
        options: "",
        required: false,
      }).success,
    ).toBe(false);
  });
});
